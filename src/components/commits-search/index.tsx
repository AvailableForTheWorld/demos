import React, { useState, useEffect } from 'react'
import { Gitlab } from '@gitbeaker/rest'
import { Table, Button, Modal, Input, Pagination, DatePicker, Tabs, Space, message, Select } from 'antd'
import { DiffEditor } from '@monaco-editor/react'
import type { Dayjs } from 'dayjs'
import { useNavigate } from 'react-router-dom'

const { RangePicker } = DatePicker

interface Event {
  id: number
  action_name: string
  created_at: string
  project_id: number
  push_data?: {
    commit_to: string
    ref_type: string
    ref: string
    commit_from: string
    commit_title: string
  }
  author: {
    name: string
  }
}

interface ProjectInfo {
  id: number
  name: string
  web_url: string
}

interface PaginationInfo {
  current: number
  next: number | null
  perPage: number
  previous: number | null
  total: number
  totalPages: number
}

interface CommitFile {
  old_path: string
  new_path: string
  new_file: boolean
  renamed_file: boolean
  deleted_file: boolean
  diff: string
  parsedDiff?: {
    original: string
    modified: string
  }
}
interface CommitDetails {
  id: string
  short_id: string
  title: string
  author_name: string
  created_at: string
  message: string
  additional_info?: string
  web_url?: string
}

interface DeletedItemInfo {
  ref_type: string
  ref: string
  commit_from: string
  action: string
  last_commit_details?: {
    short_id: string
    title: string
    author_name: string
    authored_date: string
    web_url?: string
  }
  project_url?: string
}

interface APIResponse<T> {
  data: T[]
  paginationInfo: PaginationInfo
}

const GitLabEventSearch: React.FC = () => {
  const navigate = useNavigate()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [perPage, setPerPage] = useState<number>(10)
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [commitFiles, setCommitFiles] = useState<CommitFile[]>([])
  const [pageInput, setPageInput] = useState<string>('')
  const [eventDetails, setEventDetails] = useState<CommitDetails | null>(null)
  const [deletedItemInfo, setDeletedItemInfo] = useState<DeletedItemInfo | null>(null)
  const [projectInfos, setProjectInfos] = useState<{ [key: number]: ProjectInfo }>({})
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [eventFilter, setEventFilter] = useState<'all' | 'commits' | 'pushed' | 'merged' | 'created' | 'deleted' | 'commented'>('commits')

  const [api, setApi] = useState<any | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('gitlabToken')
    if (token) {
      const newApi = new Gitlab({
        host: 'https://git.xmov.ai',
        token: token
      })
      setApi(newApi)
    } else {
      navigate('/login')
    }
  }, [navigate])

  useEffect(() => {
    if (api) {
      fetchEvents()
    }
  }, [api, currentPage, perPage, dateRange, sortOrder, eventFilter])

  const fetchEvents = async () => {
    if (!api) return
    setLoading(true)
    setError(null)

    try {
      const username = localStorage.getItem('gitlabUsername')
      const users = await api.Users.all({
        username: username || ''
      })

      if (users.length === 0) {
        throw new Error('User not found')
      }

      const userId = users[0].id

      const params: {
        userId: number
        showExpanded: boolean
        maxPages: number
        perPage: number
        page: number
        after?: string
        before?: string
        sort?: 'asc' | 'desc'
      } = {
        userId: userId,
        showExpanded: true,
        maxPages: 1,
        perPage: perPage,
        page: currentPage,
        sort: sortOrder
      }
      if (dateRange && dateRange[0] && dateRange[1]) {
        params.after = dateRange[0].toISOString()
        params.before = dateRange[1].toISOString()
      }

      const { data, paginationInfo } = (await api.Events.all(params)) as APIResponse<Event>

      // Filter events based on selected filter
      let filteredEvents = data as Event[]
      
      if (eventFilter === 'commits' || eventFilter === 'pushed') {
        filteredEvents = filteredEvents.filter(
          (event) => event.action_name === 'pushed to' || event.action_name === 'pushed new'
        )
      } else if (eventFilter === 'merged') {
        filteredEvents = filteredEvents.filter(
          (event) => event.action_name === 'accepted' || event.action_name === 'merged'
        )
      } else if (eventFilter === 'created') {
        filteredEvents = filteredEvents.filter(
          (event) => event.action_name === 'created'
        )
      } else if (eventFilter === 'deleted') {
        filteredEvents = filteredEvents.filter(
          (event) => event.action_name === 'deleted'
        )
      } else if (eventFilter === 'commented') {
        filteredEvents = filteredEvents.filter(
          (event) => event.action_name === 'commented on'
        )
      }
      // 'all' shows everything without filtering

      setEvents(filteredEvents)
      setPaginationInfo(paginationInfo)
      const uniqueProjectIds = [...new Set(data.map((event: Event) => event.project_id))]
      const projectInfoPromises = uniqueProjectIds.map(async (projectId) => {
        const projectInfo = await api.Projects.show(projectId)
        return { id: projectId, name: projectInfo.name, web_url: projectInfo.web_url }
      })

      const projectInfos = await Promise.all(projectInfoPromises)
      const projectInfoMap = projectInfos.reduce((acc, info) => {
        acc[info.id] = info
        return acc
      }, {} as { [key: number]: ProjectInfo })

      setProjectInfos(projectInfoMap)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    setDateRange(dates)
    setCurrentPage(1) // Reset to first page when changing date range
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const parseDiff = (diffContent: string) => {
    const lines = diffContent.split('\n')
    let original = ''
    let modified = ''

    lines.forEach((line) => {
      if (line.startsWith('---') || line.startsWith('+++')) {
        // Skip diff header lines
        return
      }
      if (line.startsWith('-')) {
        original += line.substring(1) + '\n'
      } else if (line.startsWith('+')) {
        modified += line.substring(1) + '\n'
      } else {
        original += line.startsWith(' ') ? line.substring(1) : line
        original += '\n'
        modified += line.startsWith(' ') ? line.substring(1) : line
        modified += '\n'
      }
    })

    return { original, modified }
  }

  const handleDetailsClick = async (event: Event) => {
    setLoading(true)
    setError(null)
    setEventDetails(null)
    setCommitFiles([])
    setDeletedItemInfo(null)

    try {
      const project = await api.Projects.show(event.project_id)
      const projectUrl = project.web_url

      switch (event.action_name) {
        case 'pushed to':
        case 'pushed new':
          if (event.push_data && event.push_data.commit_to) {
            const commit = await api.Commits.show(event.project_id, event.push_data.commit_to)
            setEventDetails({
              ...commit,
              web_url: `${projectUrl}/-/commit/${commit.id}`
            })
            const diff = await api.Commits.showDiff(event.project_id, event.push_data.commit_to)
            const processedCommitFiles = diff.map((file: CommitFile) => ({
              ...file,
              parsedDiff: parseDiff(file.diff)
            }))
            setCommitFiles(processedCommitFiles)
          }
          break
        case 'created':
          setEventDetails({
            id: event.id.toString(),
            short_id: '',
            title: `Created ${event.push_data?.ref_type || 'item'}`,
            author_name: event.author.name,
            created_at: event.created_at,
            message: `Created ${event.push_data?.ref_type || 'item'}: ${event.push_data?.ref || ''}`,
            web_url: event.push_data?.ref_type === 'branch' ? `${projectUrl}/-/tree/${event.push_data.ref}` : projectUrl
          })
          break
        case 'deleted':
          if (event.push_data) {
            const deletedInfo: DeletedItemInfo = {
              ref_type: event.push_data.ref_type,
              ref: event.push_data.ref,
              commit_from: event.push_data.commit_from,
              action: event.action_name,
              project_url: projectUrl
            }

            try {
              const lastCommit = await api.Commits.show(event.project_id, event.push_data.commit_from)
              deletedInfo.last_commit_details = {
                short_id: lastCommit.short_id,
                title: lastCommit.title,
                author_name: lastCommit.author_name,
                authored_date: lastCommit.authored_date || '',
                web_url: `${projectUrl}/-/commit/${lastCommit.id}`
              }
            } catch (commitErr) {
              console.error('Failed to fetch last commit details:', commitErr)
            }

            setEventDetails({
              id: event.id.toString(),
              short_id: '',
              title: `Deleted ${event.push_data.ref_type}`,
              author_name: event.author.name,
              created_at: event.created_at,
              message: `Deleted ${event.push_data.ref_type}: ${event.push_data.ref}`,
              web_url: projectUrl
            })
            setDeletedItemInfo(deletedInfo)
          }
          break
        default:
          setEventDetails({
            id: event.id.toString(),
            short_id: '',
            title: event.action_name,
            author_name: event.author.name,
            created_at: event.created_at,
            message: `Action: ${event.action_name}`,
            web_url: projectUrl
          })
      }
    } catch (err) {
      console.error('Failed to fetch event details:', err)
      setError((err as Error).message)
    } finally {
      setLoading(false)
      setModalVisible(true)
    }
  }

  const getLanguageFromFilename = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
      case 'vue':
        return 'javascript'
      case 'py':
        return 'python'
      case 'java':
        return 'java'
      case 'html':
        return 'html'
      case 'css':
        return 'css'
      case 'json':
        return 'json'
      default:
        return 'plaintext'
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: 'Project',
      key: 'project',
      render: (_: any, record: Event) => {
        const projectInfo = projectInfos[record.project_id]
        return projectInfo ? (
          <a href={projectInfo.web_url} target="_blank" rel="noopener noreferrer">
            {projectInfo.name}
          </a>
        ) : (
          'Loading...'
        )
      }
    },
    {
      title: 'Action',
      dataIndex: 'action_name',
      key: 'action_name'
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: (a: Event, b: Event) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      render: (text: string) => new Date(text).toLocaleString()
    },
    {
      title: 'Title',
      key: 'title',
      render(_: any, record: Event) {
        return record.push_data ? `${record.push_data.commit_title}` : ''
      }
    },
    {
      title: 'Details',
      key: 'details',
      render: (_: any, record: Event) => <Button onClick={() => handleDetailsClick(record)}>View Details</Button>
    }
  ]

  return (
    <div>
      <section style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
        <h2>GitLab History</h2>
        <Button
          onClick={() => {
            localStorage.removeItem('gitlabToken')
            localStorage.removeItem('gitlabUsername')
            window.location.href = '/login'
          }}
        >
          Logout
        </Button>
      </section>
      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          value={eventFilter}
          onChange={(value) => {
            setEventFilter(value)
            setCurrentPage(1)
          }}
          style={{ width: 180 }}
          options={[
            { value: 'commits', label: 'Commits Only' },
            { value: 'all', label: 'All Events' },
            { value: 'pushed', label: 'Push Events' },
            { value: 'merged', label: 'Merge Events' },
            { value: 'created', label: 'Created Events' },
            { value: 'deleted', label: 'Deleted Events' },
            { value: 'commented', label: 'Comment Events' }
          ]}
        />
        <RangePicker onChange={handleDateRangeChange} />
        <Select
          value={sortOrder}
          onChange={(value) => {
            setSortOrder(value)
            setCurrentPage(1) // Reset to first page when changing sort
          }}
          style={{ width: 150 }}
          options={[
            { value: 'asc', label: 'Time: Ascending' },
            { value: 'desc', label: 'Time: Descending' }
          ]}
        />
        <Button onClick={fetchEvents}>Refresh</Button>
      </Space>
      <Table dataSource={events} columns={columns} loading={loading} pagination={false} rowKey="id" />
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Pagination
          current={currentPage}
          total={paginationInfo?.total || 0}
          pageSize={perPage}
          onChange={handlePageChange}
          showSizeChanger={false}
        />
        <div>
          <Input
            style={{ width: 60, marginRight: 8 }}
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
          />
          <Button
            onClick={() => {
              const page = parseInt(pageInput)
              if (!isNaN(page) && page > 0 && page <= (paginationInfo?.totalPages || 1)) {
                setCurrentPage(page)
              }
            }}
          >
            Go
          </Button>
        </div>
      </div>
      <Modal
        title="Event Details"
        open={modalVisible}
        onOk={() => setModalVisible(false)}
        onCancel={() => setModalVisible(false)}
        width={1000}
        bodyStyle={{ maxHeight: '80vh', overflow: 'auto' }}
      >
        {eventDetails && (
          <div>
            <h3>{eventDetails.title}</h3>
            <p>Author: {eventDetails.author_name}</p>
            <p>Created at: {new Date(eventDetails.created_at).toLocaleString()}</p>
            <p>Message: {eventDetails.message}</p>
            {eventDetails.additional_info && <p>{eventDetails.additional_info}</p>}
            {eventDetails.web_url && (
              <p>
                <a href={eventDetails.web_url} target="_blank" rel="noopener noreferrer">
                  View on GitLab
                </a>
              </p>
            )}
          </div>
        )}
        {deletedItemInfo && (
          <div>
            <h4>Deleted Item Information</h4>
            <p>Type: {deletedItemInfo.ref_type}</p>
            <p>Name: {deletedItemInfo.ref}</p>
            <p>Action: {deletedItemInfo.action}</p>
            {deletedItemInfo.last_commit_details && (
              <div>
                <h5>Last Commit Before Deletion</h5>
                <p>Short ID: {deletedItemInfo.last_commit_details.short_id}</p>
                <p>Title: {deletedItemInfo.last_commit_details.title}</p>
                <p>Author: {deletedItemInfo.last_commit_details.author_name}</p>
                <p>Date: {new Date(deletedItemInfo.last_commit_details.authored_date).toLocaleString()}</p>
                {deletedItemInfo.last_commit_details.web_url && (
                  <p>
                    <a href={deletedItemInfo.last_commit_details.web_url} target="_blank" rel="noopener noreferrer">
                      View Last Commit
                    </a>
                  </p>
                )}
              </div>
            )}
            {deletedItemInfo.project_url && (
              <p>
                <a href={deletedItemInfo.project_url} target="_blank" rel="noopener noreferrer">
                  View Project
                </a>
              </p>
            )}
          </div>
        )}
        {commitFiles.length > 0 && (
          <Tabs>
            {commitFiles.map((file, index) => (
              <Tabs.TabPane tab={file.new_path} key={index}>
                {file.parsedDiff && (
                  <DiffEditor
                    height="400px"
                    language={getLanguageFromFilename(file.new_path)}
                    original={file.parsedDiff.original}
                    modified={file.parsedDiff.modified}
                    options={{
                      readOnly: true,
                      renderSideBySide: true,
                      ignoreTrimWhitespace: false,
                      renderIndicators: true,
                      originalEditable: false,
                      diffCodeLens: true,
                      scrollBeyondLastLine: false
                    }}
                  />
                )}
              </Tabs.TabPane>
            ))}
          </Tabs>
        )}
      </Modal>
    </div>
  )
}

export default GitLabEventSearch

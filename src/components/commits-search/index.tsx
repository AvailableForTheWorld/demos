import React, { useState, useEffect } from 'react'
import { Gitlab } from '@gitbeaker/rest'
import { Table, Button, Modal, Input, Pagination, Tabs } from 'antd'
import { DiffEditor } from '@monaco-editor/react'

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
  }
  author: {
    name: string
  }
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

const GitLabEventSearch: React.FC = () => {
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

  const api = new Gitlab({
    host: 'https://git.xmov.ai',
    token: import.meta.env.VITE_GITLAB_TOKEN
  })

  useEffect(() => {
    fetchEvents()
  }, [currentPage, perPage])

  const fetchEvents = async () => {
    setLoading(true)
    setError(null)

    try {
      const users = await api.Users.all({
        username: import.meta.env.VITE_GITLAB_AUTHOR
      })

      if (users.length === 0) {
        throw new Error('User not found')
      }

      const userId = users[0].id

      const { data, paginationInfo } = await api.Events.all({
        userId: userId,
        showExpanded: true,
        maxPages: 1,
        perPage: perPage,
        page: currentPage
      })

      setEvents(data as Event[])
      setPaginationInfo(paginationInfo)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
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
  const formatDeletedItemInfo = (info: DeletedItemInfo) => {
    const lastCommitInfo = info.last_commit_details
      ? `
## Last Commit Before Deletion
- **Short ID:** ${info.last_commit_details.short_id}
- **Title:** ${info.last_commit_details.title}
- **Author:** ${info.last_commit_details.author_name}
- **Date:** ${new Date(info.last_commit_details.authored_date).toLocaleString()}`
      : ''

    return `# Deleted Item Information

## Details
- **Type:** ${info.ref_type}
- **Name:** ${info.ref}
- **Action:** ${info.action}
${lastCommitInfo}

This ${info.ref_type} has been permanently deleted from the repository.
If this was unintended, please contact your project administrator immediately.
`
  }

  const handleDetailsClick = async (event: Event) => {
    setLoading(true)
    setError(null)
    setEventDetails(null)
    setCommitFiles([])
    setDeletedItemInfo(null)

    try {
      const api = new Gitlab({
        host: 'https://git.xmov.ai',
        token: import.meta.env.VITE_GITLAB_TOKEN
      })

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
      title: 'Action',
      dataIndex: 'action_name',
      key: 'action_name'
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => new Date(text).toLocaleString()
    },
    {
      title: 'Details',
      key: 'details',
      render: (_: any, record: Event) => <Button onClick={() => handleDetailsClick(record)}>View Details</Button>
    }
  ]

  return (
    <div>
      <h2>Your GitLab Events</h2>
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

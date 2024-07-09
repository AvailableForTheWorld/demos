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

const { TabPane } = Tabs

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

  const handleDetailsClick = async (event: Event) => {
    if (event.action_name.includes('pushed') && event.push_data && event.push_data.commit_to) {
      try {
        const commit = await api.Commits.showDiff(event.project_id, event.push_data.commit_to)
        const processedCommitFiles = commit.map((file: CommitFile) => ({
          ...file,
          parsedDiff: parseDiff(file.diff)
        }))
        setCommitFiles(processedCommitFiles)
        setModalVisible(true)
      } catch (err) {
        console.error('Failed to fetch commit details:', err)
      }
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
        title="Commit Details"
        open={modalVisible}
        onOk={() => setModalVisible(false)}
        onCancel={() => setModalVisible(false)}
        width={1000}
        bodyStyle={{ maxHeight: '80vh', overflow: 'auto' }}
      >
        <Tabs>
          {commitFiles.map((file, index) => (
            <TabPane tab={file.new_path} key={index}>
              <DiffEditor
                height="400px"
                language={getLanguageFromFilename(file.new_path)}
                original={file.parsedDiff?.original}
                modified={file.parsedDiff?.modified}
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
            </TabPane>
          ))}
        </Tabs>
      </Modal>
    </div>
  )
}

export default GitLabEventSearch

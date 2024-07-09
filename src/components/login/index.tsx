import { Form, Input, Button, message } from 'antd'

const Login: React.FC = () => {
  const [form] = Form.useForm()

  const onFinish = (values: { username: string; token: string }) => {
    localStorage.setItem('gitlabUsername', values.username)
    localStorage.setItem('gitlabToken', values.token)
    message.success('Login successful')
    window.location.href = '/'
  }

  return (
    <div style={{ maxWidth: 300, margin: '100px auto' }}>
      <h2>Login to GitLab History</h2>
      <Form form={form} onFinish={onFinish}>
        <Form.Item name="username" rules={[{ required: true, message: 'Please input your GitLab username!' }]}>
          <Input placeholder="GitLab Username" />
        </Form.Item>
        <Form.Item name="token" rules={[{ required: true, message: 'Please input your GitLab token!' }]}>
          <Input.Password placeholder="GitLab Token" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default Login

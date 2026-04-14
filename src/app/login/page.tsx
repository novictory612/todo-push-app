import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <main className="container">
      <div className="card">
        <div className="title">로그인</div>
        <LoginForm />
      </div>
    </main>
  );
}
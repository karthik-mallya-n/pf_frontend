import RegisterForm from "../../components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="w-full max-w-lg">
        <RegisterForm />
      </div>
    </div>
  );
}

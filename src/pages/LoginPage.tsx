import { type FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/stores/authStore";

export function LoginPage() {
	const { isAuthenticated, isLoading } = useAuthStore();
	const signIn = useAuthStore((s) => s.signIn);
	const signUp = useAuthStore((s) => s.signUp);

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [passwordConfirm, setPasswordConfirm] = useState("");
	const [error, setError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSignUpMode, setIsSignUpMode] = useState(false);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gray-50">
				<div className="text-gray-500">로딩 중...</div>
			</div>
		);
	}

	if (isAuthenticated) {
		return <Navigate to="/" replace />;
	}

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccessMessage("");
		setIsSubmitting(true);

		try {
			if (isSignUpMode) {
				if (password !== passwordConfirm) {
					setError("비밀번호가 일치하지 않습니다.");
					setIsSubmitting(false);
					return;
				}
				await signUp(email, password);
				setSuccessMessage("회원가입이 완료되었습니다. 로그인해주세요.");
				setIsSignUpMode(false);
			} else {
				await signIn(email, password);
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : "요청에 실패했습니다.";
			setError(message);
		} finally {
			setIsSubmitting(false);
		}
	};

	const toggleMode = () => {
		setIsSignUpMode((prev) => !prev);
		setPasswordConfirm("");
		setError("");
		setSuccessMessage("");
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-50">
			<div className="w-full max-w-sm p-8 bg-white rounded-xl shadow-sm border border-gray-200">
				<div className="mb-8 text-center">
					<h1 className="text-2xl font-bold text-gray-900">Seller Hub</h1>
					<p className="mt-2 text-sm text-gray-500">
						{isSignUpMode ? "새 셀러 계정을 만드세요" : "셀러 계정으로 로그인하세요"}
					</p>
				</div>

				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					<Input
						id="email"
						label="이메일"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="seller@example.com"
						required
						autoComplete="email"
						disabled={isSubmitting}
					/>

					<Input
						id="password"
						label="비밀번호"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder={isSignUpMode ? "6자 이상 입력하세요" : "비밀번호를 입력하세요"}
						required
						autoComplete={isSignUpMode ? "new-password" : "current-password"}
						disabled={isSubmitting}
					/>

					{isSignUpMode && (
						<Input
							id="password-confirm"
							label="비밀번호 확인"
							type="password"
							value={passwordConfirm}
							onChange={(e) => setPasswordConfirm(e.target.value)}
							placeholder="비밀번호를 다시 입력하세요"
							required
							autoComplete="new-password"
							disabled={isSubmitting}
							error={
								passwordConfirm && password !== passwordConfirm
									? "비밀번호가 일치하지 않습니다."
									: undefined
							}
						/>
					)}

					{error && (
						<p className="text-sm text-red-600 text-center" role="alert">
							{error}
						</p>
					)}

					{successMessage && (
						<p className="text-sm text-green-600 text-center" role="status">
							{successMessage}
						</p>
					)}

					<Button type="submit" disabled={isSubmitting} className="w-full mt-2">
						{isSubmitting
							? isSignUpMode
								? "가입 중..."
								: "로그인 중..."
							: isSignUpMode
								? "회원가입"
								: "로그인"}
					</Button>
				</form>

				<p className="mt-4 text-sm text-center text-gray-500">
					{isSignUpMode ? "이미 계정이 있으신가요?" : "계정이 없으신가요?"}{" "}
					<button
						type="button"
						onClick={toggleMode}
						className="text-primary-600 hover:text-primary-700 font-medium"
					>
						{isSignUpMode ? "로그인" : "회원가입"}
					</button>
				</p>
			</div>
		</div>
	);
}

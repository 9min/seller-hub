import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

import { cn } from "@/utils/cn";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
	className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;

		if (isOpen) {
			dialog.showModal();
		} else {
			dialog.close();
		}
	}, [isOpen]);

	if (!isOpen) return null;

	return (
		<dialog
			ref={dialogRef}
			onClose={onClose}
			className={cn(
				"p-0 m-auto rounded-xl shadow-lg border border-gray-200 backdrop:bg-black/40",
				"max-w-lg w-[calc(100%-2rem)]",
				className,
			)}
		>
			<div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
				<h2 className="text-lg font-semibold text-gray-900">{title}</h2>
				<button
					type="button"
					onClick={onClose}
					className="text-gray-400 hover:text-gray-600 text-xl leading-none"
					aria-label="닫기"
				>
					&times;
				</button>
			</div>
			<div className="px-6 py-4">{children}</div>
		</dialog>
	);
}

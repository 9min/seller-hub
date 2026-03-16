import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProductStatusBadge } from "@/components/feature/products/ProductStatusBadge";

describe("ProductStatusBadge", () => {
	it("ACTIVE → '판매중' 렌더링", () => {
		render(<ProductStatusBadge status="ACTIVE" />);
		expect(screen.getByText("판매중")).toBeInTheDocument();
	});

	it("SOLD_OUT → '품절' 렌더링", () => {
		render(<ProductStatusBadge status="SOLD_OUT" />);
		expect(screen.getByText("품절")).toBeInTheDocument();
	});

	it("HIDDEN → '숨김' 렌더링", () => {
		render(<ProductStatusBadge status="HIDDEN" />);
		expect(screen.getByText("숨김")).toBeInTheDocument();
	});
});

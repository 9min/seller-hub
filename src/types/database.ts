/**
 * Supabase 스키마 타입 정의
 * 실제 운영 시: pnpm db:types 로 자동 생성
 */
export type Database = {
	public: {
		Tables: {
			orders: {
				Row: {
					id: string;
					order_number: string;
					buyer_name: string;
					product_name: string;
					category: string;
					quantity: number;
					unit_price: number;
					total_price: number;
					status: string;
					ordered_at: string;
					shipped_at: string | null;
					delivered_at: string | null;
					is_delayed: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					order_number: string;
					buyer_name: string;
					product_name: string;
					category: string;
					quantity: number;
					unit_price: number;
					total_price: number;
					status: string;
					ordered_at: string;
					shipped_at?: string | null;
					delivered_at?: string | null;
					is_delayed?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
				Relationships: [];
			};
		};
		Functions: {
			get_kpi_metrics: {
				Args: Record<string, never>;
				Returns: Array<{
					id: string;
					label: string;
					value: number;
					changeRate: number;
					unit: string;
				}>;
			};
			get_sales_data: {
				Args: { p_period: string };
				Returns: Array<{
					label: string;
					revenue: number;
				}>;
			};
			get_category_data: {
				Args: Record<string, never>;
				Returns: Array<{
					name: string;
					value: number;
				}>;
			};
		};
		Views: Record<string, never>;
		Enums: Record<string, never>;
		CompositeTypes: Record<string, never>;
	};
};

/**
 * Supabase 스키마 타입 정의
 * 실제 운영 시: pnpm db:types 로 자동 생성
 */
export type Database = {
	public: {
		Tables: {
			products: {
				Row: {
					id: string;
					sku: string;
					name: string;
					category: string;
					unit_price: number;
					stock: number;
					sales_count: number;
					status: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					sku: string;
					name: string;
					category: string;
					unit_price: number;
					stock?: number;
					sales_count?: number;
					status?: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
				Relationships: [];
			};
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
			get_analytics_summary: {
				Args: { p_period: number };
				Returns: Array<{
					total_revenue: number;
					total_orders: number;
					avg_order_value: number;
					return_rate: number;
				}>;
			};
			get_analytics_trend: {
				Args: { p_period: number };
				Returns: Array<{
					date: string;
					revenue: number;
					orders: number;
				}>;
			};
			get_analytics_category: {
				Args: { p_period: number };
				Returns: Array<{
					category: string;
					revenue: number;
					orders: number;
				}>;
			};
			get_analytics_top_products: {
				Args: { p_period: number };
				Returns: Array<{
					product_name: string;
					revenue: number;
					orders: number;
				}>;
			};
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

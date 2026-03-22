/**
 * Supabase 스키마 타입 정의
 * 실제 운영 시: pnpm db:types 로 자동 생성
 */
export type Database = {
	public: {
		Tables: {
			sellers: {
				Row: {
					id: string;
					email: string;
					name: string;
					role: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id: string;
					email: string;
					name?: string;
					role?: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: Partial<Database["public"]["Tables"]["sellers"]["Insert"]>;
				Relationships: [];
			};
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
					seller_id: string | null;
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
					seller_id?: string;
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
					seller_id: string | null;
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
					seller_id?: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
				Relationships: [];
			};
		};
		Functions: {
			get_analytics_summary: {
				Args: { p_days: number };
				Returns: Array<{
					total_revenue: number;
					total_orders: number;
					avg_unit_price: number;
					revenue_growth_rate: number;
				}>;
			};
			get_analytics_trend: {
				Args: { p_days: number };
				Returns: Array<{
					day_index: number;
					label: string;
					current_revenue: number;
					previous_revenue: number;
				}>;
			};
			get_analytics_category: {
				Args: { p_days: number };
				Returns: Array<{
					name: string;
					revenue: number;
				}>;
			};
			get_analytics_top_products: {
				Args: { p_days: number };
				Returns: Array<{
					rank: number;
					product_name: string;
					category: string;
					quantity: number;
					revenue: number;
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

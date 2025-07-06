export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin: {
        Row: {
          created_at: string | null
          email: string
          id: string
          password_hash: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          password_hash: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          password_hash?: string
        }
        Relationships: []
      }
      chat: {
        Row: {
          created_at: string | null
          dari_user_id: string | null
          id: string
          ke_user_id: string | null
          pesan: string
          produk_id: string | null
        }
        Insert: {
          created_at?: string | null
          dari_user_id?: string | null
          id?: string
          ke_user_id?: string | null
          pesan: string
          produk_id?: string | null
        }
        Update: {
          created_at?: string | null
          dari_user_id?: string | null
          id?: string
          ke_user_id?: string | null
          pesan?: string
          produk_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_dari_user_id_fkey"
            columns: ["dari_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_ke_user_id_fkey"
            columns: ["ke_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_produk_id_fkey"
            columns: ["produk_id"]
            isOneToOne: false
            referencedRelation: "produk"
            referencedColumns: ["id"]
          },
        ]
      }
      langganan: {
        Row: {
          aktif: boolean | null
          berakhir_tanggal: string | null
          created_at: string | null
          harga: number
          id: string
          mulai_tanggal: string | null
          paket: string
          user_id: string | null
        }
        Insert: {
          aktif?: boolean | null
          berakhir_tanggal?: string | null
          created_at?: string | null
          harga: number
          id?: string
          mulai_tanggal?: string | null
          paket: string
          user_id?: string | null
        }
        Update: {
          aktif?: boolean | null
          berakhir_tanggal?: string | null
          created_at?: string | null
          harga?: number
          id?: string
          mulai_tanggal?: string | null
          paket?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "langganan_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifikasi: {
        Row: {
          created_at: string | null
          dibaca: boolean | null
          id: string
          judul: string
          pesan: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          dibaca?: boolean | null
          id?: string
          judul: string
          pesan: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          dibaca?: boolean | null
          id?: string
          judul?: string
          pesan?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifikasi_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      produk: {
        Row: {
          created_at: string | null
          deskripsi: string | null
          diskon: number | null
          foto_url: string | null
          harga: number
          id: string
          kategori: string
          lokasi: string | null
          nama: string
          penjual_id: string | null
          status: Database["public"]["Enums"]["product_status"] | null
          stok: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deskripsi?: string | null
          diskon?: number | null
          foto_url?: string | null
          harga: number
          id?: string
          kategori: string
          lokasi?: string | null
          nama: string
          penjual_id?: string | null
          status?: Database["public"]["Enums"]["product_status"] | null
          stok?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deskripsi?: string | null
          diskon?: number | null
          foto_url?: string | null
          harga?: number
          id?: string
          kategori?: string
          lokasi?: string | null
          nama?: string
          penjual_id?: string | null
          status?: Database["public"]["Enums"]["product_status"] | null
          stok?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "produk_penjual_id_fkey"
            columns: ["penjual_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      riwayat_transaksi: {
        Row: {
          created_at: string | null
          id: string
          jumlah: number
          pembeli_id: string | null
          penjual_id: string | null
          produk_id: string | null
          status: Database["public"]["Enums"]["transaction_status"] | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          jumlah: number
          pembeli_id?: string | null
          penjual_id?: string | null
          produk_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
        }
        Update: {
          created_at?: string | null
          id?: string
          jumlah?: number
          pembeli_id?: string | null
          penjual_id?: string | null
          produk_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "riwayat_transaksi_pembeli_id_fkey"
            columns: ["pembeli_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "riwayat_transaksi_penjual_id_fkey"
            columns: ["penjual_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "riwayat_transaksi_produk_id_fkey"
            columns: ["produk_id"]
            isOneToOne: false
            referencedRelation: "produk"
            referencedColumns: ["id"]
          },
        ]
      }
      topup_request: {
        Row: {
          admin_notes: string | null
          bukti_transfer_url: string | null
          created_at: string | null
          id: string
          jumlah: number
          status: Database["public"]["Enums"]["topup_status"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          bukti_transfer_url?: string | null
          created_at?: string | null
          id?: string
          jumlah: number
          status?: Database["public"]["Enums"]["topup_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          bukti_transfer_url?: string | null
          created_at?: string | null
          id?: string
          jumlah?: number
          status?: Database["public"]["Enums"]["topup_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "topup_request_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          jumlah_upload: number | null
          langganan_expire_at: string | null
          langganan_premium: boolean | null
          max_upload: number | null
          nama: string
          role: Database["public"]["Enums"]["user_role"] | null
          saldo: number | null
          status: Database["public"]["Enums"]["user_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          jumlah_upload?: number | null
          langganan_expire_at?: string | null
          langganan_premium?: boolean | null
          max_upload?: number | null
          nama: string
          role?: Database["public"]["Enums"]["user_role"] | null
          saldo?: number | null
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          jumlah_upload?: number | null
          langganan_expire_at?: string | null
          langganan_premium?: boolean | null
          max_upload?: number | null
          nama?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          saldo?: number | null
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      product_status: "pending" | "disetujui" | "ditolak"
      topup_status: "pending" | "disetujui" | "ditolak"
      transaction_status: "pending" | "selesai" | "dibatalkan"
      user_role: "pembeli" | "penjual" | "admin"
      user_status: "aktif" | "diblokir"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      product_status: ["pending", "disetujui", "ditolak"],
      topup_status: ["pending", "disetujui", "ditolak"],
      transaction_status: ["pending", "selesai", "dibatalkan"],
      user_role: ["pembeli", "penjual", "admin"],
      user_status: ["aktif", "diblokir"],
    },
  },
} as const

export type DocumentType = 'estimate' | 'invoice' | 'receipt'
export type EstimateStatus = 'draft' | 'sent' | 'cancelled'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
export type ReceiptStatus = 'draft' | 'issued'
export type DocumentStatus = EstimateStatus | InvoiceStatus | ReceiptStatus
export type SignatureType = 'drawn' | 'uploaded'
export type StyleTag = 'minimal' | 'bold' | 'classic'

export interface Database {
  public: {
    Tables: {
      users_profiles: {
        Row: {
          id: string
          business_name: string | null
          logo_url: string | null
          address: string | null
          phone: string | null
          email: string
          website: string | null
          tax_id: string | null
          signature_url: string | null
          signature_type: SignatureType | null
          currency: string
          date_format: string
          default_vat_rate: number | null
          default_estimate_template_id: string | null
          default_invoice_template_id: string | null
          default_receipt_template_id: string | null
          est_count: number
          inv_count: number
          rec_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          business_name?: string | null
          logo_url?: string | null
          address?: string | null
          phone?: string | null
          email: string
          website?: string | null
          tax_id?: string | null
          signature_url?: string | null
          signature_type?: SignatureType | null
          currency?: string
          date_format?: string
          default_vat_rate?: number | null
          default_estimate_template_id?: string | null
          default_invoice_template_id?: string | null
          default_receipt_template_id?: string | null
          est_count?: number
          inv_count?: number
          rec_count?: number
        }
        Update: {
          business_name?: string | null
          logo_url?: string | null
          address?: string | null
          phone?: string | null
          email?: string
          website?: string | null
          tax_id?: string | null
          signature_url?: string | null
          signature_type?: SignatureType | null
          currency?: string
          date_format?: string
          default_vat_rate?: number | null
          default_estimate_template_id?: string | null
          default_invoice_template_id?: string | null
          default_receipt_template_id?: string | null
        }
        Relationships: []
      }
      templates: {
        Row: {
          id: string
          name: string
          document_type: DocumentType
          thumbnail_url: string
          has_signature_block: boolean
          has_client_signature: boolean
          style_tag: StyleTag | null
          layout_config: Record<string, unknown> | null
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          document_type: DocumentType
          thumbnail_url: string
          has_signature_block?: boolean
          has_client_signature?: boolean
          style_tag?: StyleTag | null
          layout_config?: Record<string, unknown> | null
          sort_order?: number
          is_active?: boolean
        }
        Update: {
          name?: string
          thumbnail_url?: string
          has_signature_block?: boolean
          has_client_signature?: boolean
          style_tag?: StyleTag | null
          layout_config?: Record<string, unknown> | null
          sort_order?: number
          is_active?: boolean
        }
        Relationships: []
      }
      documents: {
        Row: {
          id: string
          user_id: string
          document_type: DocumentType
          status: DocumentStatus
          document_number: string
          template_id: string | null
          parent_id: string | null
          issue_date: string
          due_date: string | null
          valid_until: string | null
          paid_date: string | null
          payment_method: string | null
          payment_reference: string | null
          notes: string | null
          terms: string | null
          subtotal: number
          discount_amount: number | null
          vat_rate: number | null
          vat_amount: number | null
          total_amount: number
          currency: string
          use_signature: boolean
          pdf_url: string | null
          is_public: boolean
          public_slug: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          document_type: DocumentType
          status?: DocumentStatus
          document_number: string
          template_id?: string | null
          parent_id?: string | null
          issue_date?: string
          due_date?: string | null
          valid_until?: string | null
          paid_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          notes?: string | null
          terms?: string | null
          subtotal?: number
          discount_amount?: number | null
          vat_rate?: number | null
          vat_amount?: number | null
          total_amount?: number
          currency?: string
          use_signature?: boolean
          pdf_url?: string | null
          is_public?: boolean
          public_slug?: string | null
        }
        Update: {
          status?: DocumentStatus
          template_id?: string | null
          due_date?: string | null
          valid_until?: string | null
          paid_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          notes?: string | null
          terms?: string | null
          subtotal?: number
          discount_amount?: number | null
          vat_rate?: number | null
          vat_amount?: number | null
          total_amount?: number
          currency?: string
          use_signature?: boolean
          pdf_url?: string | null
          is_public?: boolean
          public_slug?: string | null
        }
        Relationships: []
      }
      document_sender: {
        Row: {
          id: string
          document_id: string
          business_name: string
          logo_url: string | null
          address: string | null
          phone: string | null
          email: string
          tax_id: string | null
          signature_url: string | null
        }
        Insert: {
          id?: string
          document_id: string
          business_name: string
          logo_url?: string | null
          address?: string | null
          phone?: string | null
          email: string
          tax_id?: string | null
          signature_url?: string | null
        }
        Update: {
          business_name?: string
          logo_url?: string | null
          address?: string | null
          phone?: string | null
          email?: string
          tax_id?: string | null
          signature_url?: string | null
        }
        Relationships: []
      }
      document_recipient: {
        Row: {
          id: string
          document_id: string
          client_id: string | null
          name: string
          email: string | null
          phone: string | null
          address: string | null
          tax_id: string | null
        }
        Insert: {
          id?: string
          document_id: string
          client_id?: string | null
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          tax_id?: string | null
        }
        Update: {
          client_id?: string | null
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          tax_id?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          tax_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          tax_id?: string | null
          notes?: string | null
        }
        Update: {
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          tax_id?: string | null
          notes?: string | null
        }
        Relationships: []
      }
      line_items: {
        Row: {
          id: string
          document_id: string
          position: number
          description: string
          quantity: number
          unit: string | null
          unit_price: number
          total_price: number
        }
        Insert: {
          id?: string
          document_id: string
          position?: number
          description: string
          quantity?: number
          unit?: string | null
          unit_price?: number
          total_price?: number
        }
        Update: {
          position?: number
          description?: string
          quantity?: number
          unit?: string | null
          unit_price?: number
          total_price?: number
        }
        Relationships: []
      }
      bank_details: {
        Row: {
          id: string
          document_id: string
          bank_name: string
          account_name: string
          account_number: string
          sort_code: string | null
        }
        Insert: {
          id?: string
          document_id: string
          bank_name: string
          account_name: string
          account_number: string
          sort_code?: string | null
        }
        Update: {
          bank_name?: string
          account_name?: string
          account_number?: string
          sort_code?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      get_next_document_number: {
        Args: { p_user_id: string; p_type: DocumentType }
        Returns: string
      }
      clone_document_children: {
        Args: { p_parent_id: string; p_new_id: string }
        Returns: undefined
      }
      owns_document: {
        Args: { doc_id: string }
        Returns: boolean
      }
      delete_user_account: {
        Args: Record<string, never>
        Returns: undefined
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// Convenience row types
export type UserProfile = Database['public']['Tables']['users_profiles']['Row']
export type Template = Database['public']['Tables']['templates']['Row']
export type Document = Database['public']['Tables']['documents']['Row']
export type DocumentSender = Database['public']['Tables']['document_sender']['Row']
export type DocumentRecipient = Database['public']['Tables']['document_recipient']['Row']
export type LineItem = Database['public']['Tables']['line_items']['Row']
export type BankDetails = Database['public']['Tables']['bank_details']['Row']
export type Client = Database['public']['Tables']['clients']['Row']

// Full document with all relations (for preview/detail screens)
export interface DocumentWithDetails extends Document {
  template: Template | null
  sender: DocumentSender | null
  recipient: DocumentRecipient | null
  line_items: LineItem[]
  bank_details: BankDetails | null
}

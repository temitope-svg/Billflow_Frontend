export const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
</head>
<body style="margin:0; padding:0;">
  <div style="width:100%; height:8px; background-color:#3652D9;"></div>
  <div style="width:210mm; margin:0 auto; padding:15mm; box-sizing:border-box; font-family:Helvetica,Arial,sans-serif; background-color:#FFFFFF;">

    <table style="width:100%; border-collapse:collapse;" cellpadding="0" cellspacing="0">
      <tr>
        <td style="width:56px; vertical-align:top;">
          <div style="background:#1E293B; width:56px; height:56px; border-radius:8px; overflow:hidden;">
            <img src="{{logo_url}}" style="width:100%; height:100%; object-fit:cover; border-radius:8px;"/>
          </div>
        </td>
        <td style="text-align:right; vertical-align:top;">
          <div style="font-size:38px; font-weight:300; letter-spacing:7px; text-transform:uppercase; color:#1E293B;">
            <span style="text-transform:uppercase;">{{document_type}}</span>
          </div>
          <div style="font-size:12px; color:#64748B; margin-top:8px; line-height:1.7;">
            {{document_number}}<br/>
            Payment Date: {{paid_date}}
          </div>
        </td>
      </tr>
    </table>

    <table style="width:100%; border-collapse:collapse; margin-top:36px;" cellpadding="0" cellspacing="0">
      <tr>
        <td style="width:65%; vertical-align:top;">
          <div style="font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#1E293B; margin-bottom:6px;">Received From</div>
          <div style="font-size:13px; color:#1E293B; line-height:1.6; font-weight:400;">
            {{client_name}}<br/>
            {{client_address}}<br/>
            {{client_email}}<br/>
            {{client_phone}}
          </div>
        </td>
        <td style="width:35%; vertical-align:top; text-align:right;">
          <table style="border-collapse:collapse; margin-left:auto;" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <div style="width:90px; height:90px; border-radius:50%; border:3px solid #16A34A; display:table-cell; text-align:center; vertical-align:middle; transform:rotate(-12deg); color:#16A34A; font-weight:700; font-size:16px; letter-spacing:2px;">PAID</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table style="width:100%; border-collapse:collapse; margin-top:32px;" cellpadding="0" cellspacing="0">
      <thead>
        <tr>
          <td style="text-align:left; font-weight:700; font-size:12px; color:#1E293B; border-bottom:2px solid #1E293B; padding:10px 8px 10px 0;">Description</td>
          <td style="text-align:left; font-weight:700; font-size:12px; color:#1E293B; border-bottom:2px solid #1E293B; padding:10px 8px;">Unit</td>
          <td style="text-align:right; font-weight:700; font-size:12px; color:#1E293B; border-bottom:2px solid #1E293B; padding:10px 8px;">Unit Price</td>
          <td style="text-align:right; font-weight:700; font-size:12px; color:#1E293B; border-bottom:2px solid #1E293B; padding:10px 0 10px 8px;">Total</td>
        </tr>
      </thead>
      <tbody style="font-size:12px; color:#1E293B;">{{line_items_rows}}</tbody>
    </table>

    <table style="width:100%; border-collapse:collapse; margin-top:16px;" cellpadding="0" cellspacing="0">
      <tr>
        <td style="width:60%; vertical-align:top; padding-top:8px;">
          <div style="font-size:12px; color:#1E293B; line-height:1.8;">
            Payment Method: {{payment_method}}<br/>
            <span style="color:#64748B; font-size:11px;">Ref: {{payment_reference}}</span>
          </div>
        </td>
        <td style="width:40%; vertical-align:top;">
          <table style="width:100%; border-collapse:collapse;" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:12px; color:#64748B; padding:5px 0;">Subtotal</td>
              <td style="font-size:12px; color:#1E293B; text-align:right; padding:5px 0;">{{currency}}{{subtotal}}</td>
            </tr>
            <tr>
              <td style="font-size:12px; color:#64748B; padding:5px 0;">Discount</td>
              <td style="font-size:12px; color:#1E293B; text-align:right; padding:5px 0;">{{currency}}{{discount_amount}}</td>
            </tr>
            <tr>
              <td style="font-size:12px; color:#64748B; padding:5px 0;">VAT ({{vat_rate}}%)</td>
              <td style="font-size:12px; color:#1E293B; text-align:right; padding:5px 0;">{{currency}}{{vat_amount}}</td>
            </tr>
            <tr>
              <td style="font-size:17px; font-weight:700; color:#1E293B; padding:12px 0 0 0; border-top:2px solid #3652D9;">Total</td>
              <td style="font-size:17px; font-weight:700; color:#1E293B; text-align:right; padding:12px 0 0 0; border-top:2px solid #3652D9;">{{currency}}{{total_amount}}</td>
            </tr>
            <tr>
              <td style="font-size:14px; font-weight:700; color:#16A34A; padding:8px 0 0 0;">Amount Paid</td>
              <td style="font-size:14px; font-weight:700; color:#16A34A; text-align:right; padding:8px 0 0 0;">{{currency}}{{total_amount}}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <div style="margin-top:24px;">{{signature_block}}</div>

    <div style="border-top:1px solid #E2E8F0; padding-top:10px; margin-top:20px;">
      <div style="font-size:11px; color:#64748B; line-height:1.7;">
        {{terms}}<br/>
        {{notes}}
      </div>
    </div>

    <div style="margin-top:14px;">{{bank_details_block}}</div>

  </div>
</body>
</html>`;

export const layoutConfig = {
  accentColor: "#3652D9",
  secondaryColor: "#64748B",
  backgroundColor: "#FFFFFF",
  fontFamily: "Helvetica, Arial, sans-serif",
  logoPosition: "left",
  headerStyle: "minimal",
  showBorder: false,
  borderColor: "#CBD5E1"
};

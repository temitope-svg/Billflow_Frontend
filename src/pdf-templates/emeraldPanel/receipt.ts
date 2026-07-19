export const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
</head>
<body style="margin:0; padding:0;">
  <div style="width:210mm; margin:0 auto; padding:15mm; box-sizing:border-box; font-family:Helvetica,Arial,sans-serif; background-color:#FFFFFF;">

    <div style="background:#0E6E58; border-radius:18px; padding:24px 28px;">
      <table style="width:100%; border-collapse:collapse;" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width:56px; vertical-align:top;">
            <div style="background:#FFFFFF; width:56px; height:56px; border-radius:10px; overflow:hidden;">
              <img src="{{logo_url}}" style="width:100%; height:100%; object-fit:cover; border-radius:10px;"/>
            </div>
          </td>
          <td style="width:80px; vertical-align:middle; text-align:center;">
            <table style="width:80px; height:80px; border-collapse:collapse;" cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:80px; height:80px; border-radius:50%; border:3px solid #FFFFFF; text-align:center; vertical-align:middle; transform:rotate(-10deg); color:#FFFFFF; font-weight:700; font-size:14px; letter-spacing:2px;">PAID</td>
              </tr>
            </table>
          </td>
          <td style="text-align:right; vertical-align:top;">
            <div style="font-size:38px; font-weight:700; letter-spacing:5px; text-transform:uppercase; color:#FFFFFF;">
              <span style="text-transform:uppercase;">{{document_type}}</span>
            </div>
            <div style="font-size:12px; color:#D3F4E4; margin-top:8px; line-height:1.7;">
              {{document_number}}<br/>
              Issue date: {{issue_date}}<br/>
              Payment Date: {{paid_date}}
            </div>
          </td>
        </tr>
      </table>
    </div>

    <table style="width:100%; border-collapse:collapse; margin-top:14px;" cellpadding="0" cellspacing="0">
      <tr>
        <td style="width:8px; vertical-align:top; padding-top:8px;">
          <div style="background:#0E6E58; width:8px; height:40px; border-radius:4px;"></div>
        </td>
        <td style="vertical-align:top; padding-left:12px;">
          <div style="background:#D3F4E4; border-radius:12px; padding:16px 20px;">
            <div style="font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#0E6E58; margin-bottom:6px;">Received From</div>
            <div style="font-size:13px; color:#1F2937; line-height:1.6; font-weight:400;">
              <span style="font-weight:700; text-transform:uppercase;">{{client_name}}</span>{{client_address}}{{client_email}}{{client_phone}}
            </div>
          </div>
        </td>
      </tr>
    </table>

    <table style="width:100%; border-collapse:collapse; margin-top:32px;" cellpadding="0" cellspacing="0">
      <thead>
        <tr>
          <td style="text-align:left; font-weight:700; font-size:12px; color:#1F2937; border-bottom:2px solid #1F2937; padding:10px 8px 10px 0;">Description</td>
          <td style="text-align:left; font-weight:700; font-size:12px; color:#1F2937; border-bottom:2px solid #1F2937; padding:10px 8px;">Unit</td>
          <td style="text-align:right; font-weight:700; font-size:12px; color:#1F2937; border-bottom:2px solid #1F2937; padding:10px 8px;">Unit Price</td>
          <td style="text-align:right; font-weight:700; font-size:12px; color:#1F2937; border-bottom:2px solid #1F2937; padding:10px 0 10px 8px;">Total</td>
        </tr>
      </thead>
      <tbody style="font-size:12px; color:#1F2937;">{{line_items_rows}}</tbody>
    </table>

    <table style="width:100%; border-collapse:collapse; margin-top:18px;" cellpadding="0" cellspacing="0">
      <tr>
        <td style="width:55%;">&nbsp;</td>
        <td style="width:45%; vertical-align:top;">
          <div style="background:#0E6E58; border-radius:10px; padding:14px 18px;">
            <table style="width:100%; border-collapse:collapse;" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:12px; color:#D3F4E4; padding:5px 0;">Subtotal</td>
                <td style="font-size:12px; color:#FFFFFF; text-align:right; padding:5px 0;">{{currency}}{{subtotal}}</td>
              </tr>
              <tr>
                <td style="font-size:12px; color:#D3F4E4; padding:5px 0;">Discount</td>
                <td style="font-size:12px; color:#FFFFFF; text-align:right; padding:5px 0;">{{currency}}{{discount_amount}}</td>
              </tr>
              <tr>
                <td style="font-size:12px; color:#D3F4E4; padding:5px 0;">VAT ({{vat_rate}}%)</td>
                <td style="font-size:12px; color:#FFFFFF; text-align:right; padding:5px 0;">{{currency}}{{vat_amount}}</td>
              </tr>
              <tr>
                <td style="font-size:17px; font-weight:700; color:#FFFFFF; padding:12px 0 0 0; border-top:1px solid rgba(255,255,255,0.4);">Amount Paid:</td>
                <td style="font-size:17px; font-weight:700; color:#FFFFFF; text-align:right; padding:12px 0 0 0; border-top:1px solid rgba(255,255,255,0.4);">{{currency}}{{total_amount}}</td>
              </tr>
            </table>
          </div>
        </td>
      </tr>
    </table>

    <div style="margin-top:20px; font-size:12px; color:#1F2937; line-height:1.7;">
      Payment Method: {{payment_method}}<br/>
      Ref: {{payment_reference}}
    </div>

    <div style="margin-top:24px;">{{signature_block}}</div>

    <div style="border-top:1px solid #D3F4E4; padding-top:10px; margin-top:20px;">
      <div style="font-size:11px; color:#1F2937; line-height:1.7;">
        {{terms}}<br/>
        {{notes}}
      </div>
    </div>

    <div style="margin-top:14px;">{{bank_details_block}}</div>

    <div style="margin-top:20px; text-align:center; font-size:11px; color:#9CA3AF;">Thank you for your business</div>

  </div>
</body>
</html>`;

export const layoutConfig = {
  accentColor: "#0E6E58",
  secondaryColor: "#D3F4E4",
  backgroundColor: "#FFFFFF",
  fontFamily: "Helvetica, Arial, sans-serif",
  logoPosition: "left",
  headerStyle: "banner",
  showBorder: false,
  borderColor: "#0E6E58"
};

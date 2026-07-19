export const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
</head>
<body style="margin:0; padding:0;">
  <div style="width:210mm; margin:0 auto; padding:15mm; box-sizing:border-box; font-family:Georgia,'Times New Roman',Times,serif; background-color:#FBF3DF; color:#2B2118;">

    <div style="border:1px solid #A67C3D; padding:4px;">
      <div style="border:1px solid #A67C3D; padding:16px 24px; text-align:center;">
        <div style="text-align:center; margin-bottom:8px;">
          <img src="{{logo_url}}" style="max-height:32px; max-width:100px;"/>
        </div>
        <div style="font-size:19px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#2B2118;">{{business_name}}</div>
        <div style="font-size:11px; color:#2B2118; margin-top:6px; line-height:1.6;">
          {{business_address}}<br/>
          {{business_email}} &nbsp;&bull;&nbsp; {{business_phone}} &nbsp;&bull;&nbsp; {{business_tax_id}}
        </div>
      </div>
    </div>

    <div style="text-align:center; margin-top:20px;">
      <span style="letter-spacing:10px; font-size:30px; text-transform:uppercase; font-weight:700; color:#2B2118;">{{document_type}}</span>
    </div>

    <div style="text-align:center; margin-top:10px; padding-bottom:10px; border-bottom:1px solid #A67C3D;">
      <span style="font-size:12px; text-transform:uppercase; letter-spacing:1px; color:#2B2118;">
        ESTIMATE NO: {{document_number}} &nbsp;&nbsp;|&nbsp;&nbsp; ISSUE DATE: {{issue_date}}{{valid_until_meta}}
      </span>
    </div>

    <div style="margin-top:20px; text-align:left;">
      <div style="font-size:12px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#2B2118; margin-bottom:6px;">Prepared For</div>
      <div style="font-size:13px; color:#2B2118; line-height:1.7; font-weight:400; text-transform:uppercase;">
        {{client_name}}{{client_address}}{{client_email}}{{client_phone}}
      </div>
    </div>

    <table style="width:100%; border-collapse:collapse; margin-top:28px; text-transform:uppercase;" cellpadding="0" cellspacing="0">
      <thead>
        <tr>
          <td style="text-align:left; font-weight:700; font-size:12px; color:#2B2118; border:1px solid #A67C3D; padding:10px 12px; background-color:#F3E9CE;">Description</td>
          <td style="text-align:left; font-weight:700; font-size:12px; color:#2B2118; border:1px solid #A67C3D; padding:10px 12px; background-color:#F3E9CE;">Unit</td>
          <td style="text-align:right; font-weight:700; font-size:12px; color:#2B2118; border:1px solid #A67C3D; padding:10px 12px; background-color:#F3E9CE;">Unit Price</td>
          <td style="text-align:right; font-weight:700; font-size:12px; color:#2B2118; border:1px solid #A67C3D; padding:10px 12px; background-color:#F3E9CE;">Total</td>
        </tr>
      </thead>
      <tbody style="font-size:12px; color:#2B2118;">{{line_items_rows}}</tbody>
    </table>

    <table style="width:100%; border-collapse:collapse; margin-top:18px;" cellpadding="0" cellspacing="0">
      <tr>
        <td style="width:55%;">&nbsp;</td>
        <td style="width:45%; vertical-align:top;">
          <table style="width:100%; border-collapse:collapse;" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:13px; text-transform:uppercase; color:#2B2118; padding:5px 0;">Subtotal:</td>
              <td style="font-size:13px; color:#2B2118; text-align:right; padding:5px 0;">{{currency}}{{subtotal}}</td>
            </tr>
            <tr>
              <td style="font-size:13px; text-transform:uppercase; color:#2B2118; padding:5px 0;">Discount:</td>
              <td style="font-size:13px; color:#2B2118; text-align:right; padding:5px 0;">{{currency}}{{discount_amount}}</td>
            </tr>
            <tr>
              <td style="font-size:13px; text-transform:uppercase; color:#2B2118; padding:5px 0;">Tax ({{vat_rate}}%):</td>
              <td style="font-size:13px; color:#2B2118; text-align:right; padding:5px 0;">{{currency}}{{vat_amount}}</td>
            </tr>
          </table>
          <table style="width:100%; border-collapse:collapse; margin-top:10px;" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:17px; font-weight:700; text-transform:uppercase; color:#2B2118; padding:10px 0; border-top:3px double #A67C3D; border-bottom:3px double #A67C3D;">Estimated Total:</td>
              <td style="font-size:17px; font-weight:700; color:#2B2118; text-align:right; padding:10px 0; border-top:3px double #A67C3D; border-bottom:3px double #A67C3D;">{{currency}}{{total_amount}}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <div style="margin-top:28px; text-align:center;">
      <div style="font-size:13px; font-style:italic; color:#2B2118;">Validity: This estimate is valid until the stated date.</div>
      <div style="margin-top:20px;">
        <div style="border-top:1px solid #2B2118; width:220px; margin:0 auto 6px auto;"></div>
        <div style="font-size:13px; font-style:italic; color:#2B2118;">Acceptance (Client Signature)</div>
      </div>
    </div>

    <div style="margin-top:28px; text-align:center;">{{signature_block}}</div>

    <div style="color:#A67C3D; font-size:16px; text-align:center; margin:16px 0;">&#10086;</div>

  </div>
</body>
</html>`;

export const layoutConfig = {
  accentColor: "#A67C3D",
  secondaryColor: "#2B2118",
  backgroundColor: "#FBF3DF",
  fontFamily: "Georgia, 'Times New Roman', Times, serif",
  logoPosition: "center",
  headerStyle: "split",
  showBorder: true,
  borderColor: "#A67C3D"
};

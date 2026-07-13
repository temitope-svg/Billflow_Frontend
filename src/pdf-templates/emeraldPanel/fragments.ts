export const signatureBlockHtml = `<table style="width:100%; border-collapse:collapse; margin-top:8px;" cellpadding="0" cellspacing="0">
  <tr>
    <td style="width:50%; vertical-align:top; padding-right:16px;">
      <table style="width:100%; border-collapse:collapse;" cellpadding="0" cellspacing="0">
        <tr>
          <td style="height:50px; vertical-align:bottom;">
            <img src="{{signature_url}}" style="max-height:50px;"/>
          </td>
        </tr>
        <tr>
          <td style="border-top:1px solid #0E6E58; padding-top:6px;">
            <span style="font-size:10px; letter-spacing:1px; text-transform:uppercase; color:#0E6E58;">Authorised signature</span>
          </td>
        </tr>
      </table>
    </td>
    <td style="width:50%; vertical-align:top; padding-left:16px;">
      <table style="width:100%; border-collapse:collapse;" cellpadding="0" cellspacing="0">
        <tr>
          <td style="height:50px;">&nbsp;</td>
        </tr>
        <tr>
          <td style="border-top:1px solid #0E6E58; padding-top:6px;">
            <span style="font-size:10px; letter-spacing:1px; text-transform:uppercase; color:#0E6E58;">Client signature</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

export const bankDetailsBlockHtml = `<div style="font-size:11px; color:#1F2937; line-height:1.6;">
  Bank Transfer: {{bank_name}}, Account Name: {{account_name}}, Account No: {{account_number}}
</div>`;

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
          <td style="border-top:1px solid #1E293B; padding-top:6px;">
            <span style="font-size:10px; letter-spacing:1px; text-transform:uppercase; color:#64748B;">Authorised signature</span>
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
          <td style="border-top:1px solid #1E293B; padding-top:6px;">
            <span style="font-size:10px; letter-spacing:1px; text-transform:uppercase; color:#64748B;">Client signature</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

export const bankDetailsBlockHtml = `<div style="font-size:11px; color:#64748B; line-height:1.6;">
  Bank Transfer: {{bank_name}}<br/>
  Account Name: {{account_name}}<br/>
  Account No: {{account_number}}
</div>`;

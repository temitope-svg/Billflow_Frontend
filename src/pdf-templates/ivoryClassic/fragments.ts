export const signatureBlockHtml = `<table style="width:100%; border-collapse:collapse; margin-top:8px;" cellpadding="0" cellspacing="0">
  <tr>
    <td style="width:50%; vertical-align:top; padding-right:16px;">
      <table style="width:100%; border-collapse:collapse;" cellpadding="0" cellspacing="0">
        <tr>
          <td style="height:50px; vertical-align:bottom; text-align:center;">
            <img src="{{signature_url}}" style="max-height:50px;"/>
          </td>
        </tr>
        <tr>
          <td style="border-top:1px solid #A67C3D; padding-top:6px; text-align:center;">
            <span style="font-size:11px; font-style:italic; letter-spacing:0.5px; color:#2B2118;">Authorised Signature</span>
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
          <td style="border-top:1px solid #A67C3D; padding-top:6px; text-align:center;">
            <span style="font-size:11px; font-style:italic; letter-spacing:0.5px; color:#2B2118;">Client Signature</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

export const bankDetailsBlockHtml = `<div style="font-size:12px; font-style:italic; color:#2B2118; line-height:1.6; text-align:center;">
  Bank Transfer: {{bank_name}}<br/>
  Account Name: {{account_name}}<br/>
  Account No: {{account_number}}
</div>`;

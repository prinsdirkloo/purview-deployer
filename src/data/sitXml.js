// XML building blocks for BUI custom SITs.
// Each entry provides the three XML sections needed in the rule package:
//   entityBlock  - the <Entity> (or <Version><Entity>) element
//   regexBlock   - the <Regex> element
//   keywordBlock - the <Keyword> element(s)
//   localizedName / localizedDesc - for the <LocalizedStrings> section

export const SIT_XML = {
  sa_company_reg: {
    entityBlock: `    <Entity id="5779832b-b170-494f-b18d-05dc50f078b0"
            patternsProximity="50" recommendedConfidence="75" relaxProximity="false">
      <Pattern confidenceLevel="75">
        <IdMatch idRef="Regex_SACompanyRegistrationNumber" />
        <Match idRef="Keywords_SACompanyRegistrationNumber" />
      </Pattern>
    </Entity>`,
    regexBlock: `    <Regex id="Regex_SACompanyRegistrationNumber">\\b\\d{4}\\/\\d{4,7}\\/\\d{2}\\b</Regex>`,
    keywordBlock: `    <Keyword id="Keywords_SACompanyRegistrationNumber">
      <Group matchStyle="word">
        <Term>Company Registration Number</Term><Term>Company Registration Num</Term><Term>Company Registration No</Term>
        <Term>Company Reg Number</Term><Term>Company Reg Num</Term><Term>Company Reg No</Term>
        <Term>CIPC</Term><Term>CIPC Number</Term><Term>Enterprise Number</Term><Term>Incorporation Number</Term>
        <Term>Business Registration Number</Term><Term>Business Reg Number</Term><Term caseSensitive="false">Business Reg No</Term>
      </Group>
    </Keyword>`,
    localizedName: 'South African Company Registration Number',
    localizedDesc: 'CIPC company registration number in the format YYYY/XXXXXXX/XX, within proximity of company registration keywords.',
    wrapVersion: false,
  },
  sa_mobile: {
    entityBlock: `    <Entity id="537c36cf-a3a9-4719-a4cd-183894bea0d9"
            patternsProximity="50" recommendedConfidence="75" relaxProximity="false">
      <Pattern confidenceLevel="75">
        <IdMatch idRef="Regex_SAMobileNumber" />
        <Match idRef="Keywords_SAMobileNumber" />
      </Pattern>
    </Entity>`,
    regexBlock: `    <Regex id="Regex_SAMobileNumber">(\\+27|27|0)( |-|_)?([6][0-9]|[7][1-9]|[8][0-4])( |-|_)?(\\d{3})( |-|_)?(\\d{4})</Regex>`,
    keywordBlock: `    <Keyword id="Keywords_SAMobileNumber">
      <Group matchStyle="word">
        <Term>mobile</Term><Term>mobile no</Term><Term>mobile number</Term>
        <Term>cell</Term><Term>cell no</Term><Term>cell number</Term>
        <Term>cellular</Term><Term>cellphone</Term><Term>cellphone number</Term>
        <Term>phone</Term><Term>phone no</Term><Term caseSensitive="false">phone number</Term>
      </Group>
    </Keyword>`,
    localizedName: 'South African Mobile Number',
    localizedDesc: 'South African mobile phone number with +27/27/0 prefix within proximity of mobile/cell/phone keywords.',
    wrapVersion: false,
  },
  sa_bank: {
    entityBlock: `    <Version minEngineVersion="15.01.0998.000">
      <Entity id="a6b97e82-7f65-4c7e-82f6-7c850e815386"
              patternsProximity="50" recommendedConfidence="75" relaxProximity="false">
        <Pattern confidenceLevel="75">
          <IdMatch idRef="Regex_SABankAccountNumber" />
          <Match idRef="Keywords_SABankName" />
          <Match idRef="Keywords_SABankAccountType" />
          <Match idRef="Keywords_SABankAccountField" />
        </Pattern>
      </Entity>
    </Version>`,
    regexBlock: `    <Regex id="Regex_SABankAccountNumber">([0-9]{10}|[0-9]{11}|[0-9]{12})</Regex>`,
    keywordBlock: `    <Keyword id="Keywords_SABankName">
      <Group matchStyle="word">
        <Term>Absa</Term><Term>African Bank</Term><Term>Capitec</Term><Term>Discovery Bank</Term>
        <Term>First National</Term><Term>FNB</Term><Term>FirstRand</Term><Term>Investec</Term>
        <Term>Nedbank</Term><Term>Standard Bank</Term><Term>TymeBank</Term><Term>Bidvest</Term>
        <Term>Grindrod</Term><Term>Ithala</Term><Term>Mercantile</Term><Term>Sasfin</Term>
        <Term caseSensitive="false">Finbond</Term>
      </Group>
    </Keyword>
    <Keyword id="Keywords_SABankAccountType">
      <Group matchStyle="word">
        <Term>business account</Term><Term>cheque account</Term><Term>current account</Term>
        <Term>savings account</Term><Term>fixed deposit</Term><Term caseSensitive="false">transactional account</Term>
      </Group>
    </Keyword>
    <Keyword id="Keywords_SABankAccountField">
      <Group matchStyle="word">
        <Term>account holder</Term><Term>account number</Term><Term>account type</Term>
        <Term>bank name</Term><Term>bank statement</Term><Term>branch code</Term>
        <Term caseSensitive="false">institution name</Term>
      </Group>
    </Keyword>`,
    localizedName: 'South African Bank Account Number',
    localizedDesc: '10-12 digit bank account number within proximity of SA bank name, account type, and account field.',
    wrapVersion: true,
  },
  sa_company_tax: {
    entityBlock: `    <Version minEngineVersion="15.01.0998.000">
      <Entity id="bd938c71-5bed-4156-91ec-a8cb68fd1525"
              patternsProximity="50" recommendedConfidence="75" relaxProximity="false">
        <Pattern confidenceLevel="75">
          <IdMatch idRef="Regex_SACompanyIncomeTaxNumber" />
          <Match idRef="Keywords_SACompanyIncomeTaxNumber" />
        </Pattern>
      </Entity>
    </Version>`,
    regexBlock: `    <Regex id="Regex_SACompanyIncomeTaxNumber">\\b9\\d{9}\\b</Regex>`,
    keywordBlock: `    <Keyword id="Keywords_SACompanyIncomeTaxNumber">
      <Group matchStyle="word">
        <Term>Income Tax Number</Term><Term>Tax Reference Number</Term><Term>Tax Ref Number</Term>
        <Term>Corporate Tax Number</Term><Term>Company Tax Number</Term>
        <Term>SARS Tax Number</Term><Term>SARS Tax Reference Number</Term>
        <Term caseSensitive="false">SARS Tax Ref No</Term>
      </Group>
    </Keyword>`,
    localizedName: 'South African Company Income Tax Number',
    localizedDesc: 'SARS company income tax reference number (starts with 9, 10 digits) within proximity of tax keywords.',
    wrapVersion: true,
  },
  sa_dob: {
    entityBlock: `    <Version minEngineVersion="15.01.0998.000">
      <Entity id="07dee987-6d0f-4fdb-ab08-cff8bfbc31d8"
              patternsProximity="50" recommendedConfidence="75" relaxProximity="false">
        <Pattern confidenceLevel="75">
          <IdMatch idRef="Regex_SADateOfBirth" />
          <Match idRef="Keywords_SADateOfBirth" />
        </Pattern>
      </Entity>
    </Version>`,
    regexBlock: `    <Regex id="Regex_SADateOfBirth">(\\b((19\\d{2}|20\\d{2})(\\/|\\-|\\.)(0[1-9]|1[012])(\\/|\\-|\\.)(0[1-9]|[12][0-9]|3[01])|(0[1-9]|[12][0-9]|3[01])(\\/|\\-|\\.)(0[1-9]|1[012])(\\/|\\-|\\.)(19\\d{2}|20\\d{2}))\\b)</Regex>`,
    keywordBlock: `    <Keyword id="Keywords_SADateOfBirth">
      <Group matchStyle="word">
        <Term>dob</Term><Term>d.o.b</Term><Term>date of birth</Term>
        <Term>birth date</Term><Term>born</Term><Term caseSensitive="false">yob</Term>
      </Group>
    </Keyword>`,
    localizedName: 'South African Date of Birth',
    localizedDesc: 'Date value in a common SA format within proximity of date-of-birth keywords.',
    wrapVersion: true,
  },
  sa_paye: {
    entityBlock: `    <Version minEngineVersion="15.01.0998.000">
      <Entity id="5f320260-18be-4c32-bfb0-261362f1b792"
              patternsProximity="50" recommendedConfidence="75" relaxProximity="false">
        <Pattern confidenceLevel="75">
          <IdMatch idRef="Regex_SAPAYERegistrationNumber" />
          <Match idRef="Keywords_SAPAYERegistrationNumber" />
        </Pattern>
      </Entity>
    </Version>`,
    regexBlock: `    <Regex id="Regex_SAPAYERegistrationNumber">\\b7\\d{9}\\b</Regex>`,
    keywordBlock: `    <Keyword id="Keywords_SAPAYERegistrationNumber">
      <Group matchStyle="word">
        <Term>PAYE Reference Number</Term><Term>PAYE Ref Number</Term><Term>SARS PAYE</Term>
        <Term>PAYE Registration Number</Term><Term>Pay as you Earn Number</Term>
        <Term>Pay as you Earn Reference Number</Term><Term caseSensitive="false">PAYE Information</Term>
      </Group>
    </Keyword>`,
    localizedName: 'South African PAYE Number',
    localizedDesc: 'SARS PAYE registration number (starts with 7, 10 digits) within proximity of PAYE keywords.',
    wrapVersion: true,
  },
  sa_personal_tax: {
    entityBlock: `    <Version minEngineVersion="15.01.0998.000">
      <Entity id="6a3a63d6-a69f-4189-8648-ae4c451f08b7"
              patternsProximity="50" recommendedConfidence="75" relaxProximity="false">
        <Pattern confidenceLevel="75">
          <IdMatch idRef="Regex_SAPersonalIncomeTaxNumber" />
          <Match idRef="Keywords_SAPersonalIncomeTaxNumber" />
        </Pattern>
      </Entity>
    </Version>`,
    regexBlock: `    <Regex id="Regex_SAPersonalIncomeTaxNumber">\\b\\d{4}\\/\\d{7}\\/\\d{2}\\b</Regex>`,
    keywordBlock: `    <Keyword id="Keywords_SAPersonalIncomeTaxNumber">
      <Group matchStyle="word">
        <Term>Personal Income Tax Number</Term><Term>Tax Reference Number</Term><Term>Tax Ref Number</Term>
        <Term>Taxpayer Number</Term><Term caseSensitive="false">Taxpayer No</Term>
      </Group>
    </Keyword>`,
    localizedName: 'South African Personal Income Tax Number',
    localizedDesc: 'SARS personal income tax reference number in the format NNNN/NNNNNNN/NN.',
    wrapVersion: true,
  },
  sa_uif: {
    entityBlock: `    <Version minEngineVersion="15.01.0998.000">
      <Entity id="e11a1e65-2ef2-4698-b360-6f9ebfc9823f"
              patternsProximity="50" recommendedConfidence="75" relaxProximity="false">
        <Pattern confidenceLevel="75">
          <IdMatch idRef="Regex_SAUIFNumber" />
          <Match idRef="Keywords_SAUIFNumber" />
        </Pattern>
      </Entity>
    </Version>`,
    regexBlock: `    <Regex id="Regex_SAUIFNumber">\\b\\d{6}\\/\\d{1}\\b</Regex>`,
    keywordBlock: `    <Keyword id="Keywords_SAUIFNumber">
      <Group matchStyle="word">
        <Term>UIF Number</Term><Term>UIF Reference Number</Term><Term>UIF Ref Number</Term>
        <Term>Unemployment Insurance Fund</Term><Term>UIF Registration</Term>
        <Term caseSensitive="false">UIF Information</Term>
      </Group>
    </Keyword>`,
    localizedName: 'South African UIF Number',
    localizedDesc: 'Unemployment Insurance Fund reference number in the format NNNNNN/N.',
    wrapVersion: true,
  },
  sa_vat: {
    entityBlock: `    <Version minEngineVersion="15.01.0998.000">
      <Entity id="44604fab-4b4c-4e7a-a301-5888163eb630"
              patternsProximity="50" recommendedConfidence="75" relaxProximity="false">
        <Pattern confidenceLevel="75">
          <IdMatch idRef="Regex_SAVATRegistrationNumber" />
          <Match idRef="Keywords_SAVATRegistrationNumber" />
        </Pattern>
      </Entity>
    </Version>`,
    regexBlock: `    <Regex id="Regex_SAVATRegistrationNumber">\\b4\\d{9}\\b</Regex>`,
    keywordBlock: `    <Keyword id="Keywords_SAVATRegistrationNumber">
      <Group matchStyle="word">
        <Term>VAT Number</Term><Term>VAT Num</Term><Term>VAT No</Term>
        <Term>Value Added Tax</Term><Term>VAT Registration Number</Term><Term>VAT Ref Number</Term>
        <Term>VAT Details</Term><Term caseSensitive="false">Value Added Tax Information</Term>
      </Group>
    </Keyword>`,
    localizedName: 'South African VAT Number',
    localizedDesc: 'SARS VAT registration number (starts with 4, 10 digits) within proximity of VAT keywords.',
    wrapVersion: true,
  },
}

// Catalogue of built-in Purview SITs available to add to policies via the picker modal.
// Only Name, GUID, and confidence level are needed — matching logic is compiled into Purview.
// Sourced from a live Purview environment export.

export const BUILTIN_CATALOGUE = [
  // ── South Africa (pinned first) ──
  { name:'South Africa Identification Number',                         guid:'e2adf7cb-8ea6-4048-a2ed-d89eb65f2780', conf:'High',   group:'pii',       tag:'pii', region:'ZA', locked:true },
  { name:'South Africa Physical Addresses',                            guid:'0311f67f-d239-4f57-bde7-bd76253576eb', conf:'Medium', group:'pii',       tag:'pii', region:'ZA', locked:true },
  // ── Global ──
  { name:'Credit Card Number',                                         guid:'50842eb7-edc8-4019-85dd-5a5c1f2bb085', conf:'High',   group:'financial', tag:'fin', region:'Global', locked:true },
  { name:'International Banking Account Number (IBAN)',                guid:'e7dc4711-11b7-4cb0-b88b-2c394a2f8573', conf:'High',   group:'financial', tag:'fin', region:'Global' },
  { name:'SWIFT Code',                                                  guid:'cb2ab58c-9cb8-4c81-baf8-a4e106791df4', conf:'High',   group:'financial', tag:'fin', region:'Global' },
  { name:'ABA Routing Number',                                          guid:'cb353f78-2b72-4c3c-8827-92ebe4f69fdf', conf:'High',   group:'financial', tag:'fin', region:'Global' },
  { name:'IP Address',                                                  guid:'1daa4ad5-e2dd-4ca4-a788-54722c09efb2', conf:'Medium', group:'pii',       tag:'pii', region:'Global' },
  { name:'All Full Names',                                              guid:'50b8b56b-4ef8-44c2-a924-03374f5831ce', conf:'Medium', group:'pii',       tag:'pii', region:'Global' },
  { name:'All Physical Addresses',                                      guid:'8548332d-6d71-41f8-97db-cc3b5fa544e6', conf:'Medium', group:'pii',       tag:'pii', region:'Global' },
  { name:'All Medical Terms And Conditions',                            guid:'065bdd91-ef07-40d3-b8a4-0aea722eaa49', conf:'Medium', group:'pii',       tag:'pii', region:'Global' },
  { name:'Drug Enforcement Agency (DEA) Number',                       guid:'9a5445ad-406e-43eb-8bd7-cac17ab6d0e4', conf:'High',   group:'pii',       tag:'pii', region:'Global' },
  { name:'International Classification of Diseases (ICD-10-CM)',       guid:'3356946c-6bb7-449b-b253-6ffa419c0ce7', conf:'Medium', group:'pii',       tag:'pii', region:'Global' },
  // ── EU ──
  { name:'EU Debit Card Number',                                        guid:'0e9b3178-9678-47dd-a509-37222ca96b42', conf:'High',   group:'financial', tag:'fin', region:'EU' },
  { name:"EU Driver's License Number",                                  guid:'b8fe86d1-c056-453b-bfaa-9fe698699ecc', conf:'Medium', group:'pii',       tag:'pii', region:'EU' },
  { name:'EU National Identification Number',                           guid:'419f449f-6d9d-4be1-a154-b531f7a91b41', conf:'Medium', group:'pii',       tag:'pii', region:'EU' },
  { name:'EU Passport Number',                                          guid:'21883626-6245-4f3d-9b61-5cbb43e625ee', conf:'Medium', group:'pii',       tag:'pii', region:'EU' },
  { name:'EU Social Security Number (SSN) or Equivalent ID',           guid:'d24e32a4-c0bb-4ba8-899d-6303b95742d9', conf:'Medium', group:'pii',       tag:'pii', region:'EU' },
  { name:'EU Tax Identification Number (TIN)',                          guid:'e09c07d3-66e5-4783-989d-49ac62748f5f', conf:'Medium', group:'pii',       tag:'pii', region:'EU' },
  // ── UK ──
  { name:"U.K. Driver's License Number",                               guid:'f93de4be-d94c-40df-a8be-461738047551', conf:'Medium', group:'pii',       tag:'pii', region:'UK' },
  { name:'U.K. National Health Service Number',                        guid:'3192014e-2a16-44e9-aa69-4b20375c9a78', conf:'High',   group:'pii',       tag:'pii', region:'UK' },
  { name:'U.K. National Insurance Number (NINO)',                      guid:'16c07343-c26f-49d2-a987-3daf717e94cc', conf:'High',   group:'pii',       tag:'pii', region:'UK' },
  { name:'U.K. Unique Taxpayer Reference Number',                      guid:'ad4a8116-0db8-439a-b545-6d967642f0ec', conf:'High',   group:'pii',       tag:'pii', region:'UK' },
  { name:'U.S. / U.K. Passport Number',                                guid:'178ec42a-18b4-47cc-85c7-d62c92fd67f8', conf:'Medium', group:'pii',       tag:'pii', region:'UK' },
  // ── US ──
  { name:'U.S. Bank Account Number',                                    guid:'a2ce32a8-f935-4bb6-8e96-2a5157672e2c', conf:'High',   group:'financial', tag:'fin', region:'US' },
  { name:"U.S. Driver's License Number",                               guid:'dfeb356f-61cd-459e-bf0f-7c6d28b458c6', conf:'Medium', group:'pii',       tag:'pii', region:'US' },
  { name:'U.S. Individual Taxpayer Identification Number (ITIN)',       guid:'e55e2a32-f92d-4985-a35d-a0b269eb687b', conf:'High',   group:'pii',       tag:'pii', region:'US' },
  { name:'U.S. Social Security Number (SSN)',                           guid:'a44669fe-0d48-453d-a9b1-2cc83f2cba77', conf:'High',   group:'pii',       tag:'pii', region:'US' },
  { name:'U.S. Physical Addresses',                                     guid:'44aa44f2-63d1-41df-af0d-970283ac41e2', conf:'Medium', group:'pii',       tag:'pii', region:'US' },
  // ── APAC ──
  { name:'Australia Bank Account Number',                               guid:'74a54de9-2a30-4aa0-a8aa-3d9327fc07c7', conf:'High',   group:'financial', tag:'fin', region:'APAC' },
  { name:'Australia Tax File Number',                                   guid:'e29bc95f-ff70-4a37-aa01-04d17360a4c5', conf:'High',   group:'financial', tag:'fin', region:'APAC' },
  { name:'Australia Passport Number',                                   guid:'29869db6-602d-4853-ab93-3484f905df50', conf:'Medium', group:'pii',       tag:'pii', region:'APAC' },
  { name:'Canada Bank Account Number',                                  guid:'552e814c-cb50-4d94-bbaa-bb1d1ffb34de', conf:'High',   group:'financial', tag:'fin', region:'APAC' },
  { name:'Canada Social Insurance Number',                              guid:'a2f29c85-ecb8-4514-a610-364790c0773e', conf:'High',   group:'pii',       tag:'pii', region:'APAC' },
  { name:'India Permanent Account Number (PAN)',                        guid:'2602bfee-9bb0-47a5-a7a6-2bf3053e2804', conf:'High',   group:'pii',       tag:'pii', region:'APAC' },
  { name:'India Unique Identification (Aadhaar) Number',               guid:'1ca46b29-76f5-4f46-9383-cfa15e91048f', conf:'High',   group:'pii',       tag:'pii', region:'APAC' },
  { name:'Japan Bank Account Number',                                   guid:'d354f95b-96ee-4b80-80bc-4377312b55bc', conf:'High',   group:'financial', tag:'fin', region:'APAC' },
  { name:'Japan Social Insurance Number (SIN)',                        guid:'c840e719-0896-45bb-84fd-1ed5c95e45ff', conf:'High',   group:'pii',       tag:'pii', region:'APAC' },
  { name:'Singapore National Registration Identity Card (NRIC) Number', guid:'cead390a-dd83-4856-9751-fb6dc98c34da', conf:'High',   group:'pii',       tag:'pii', region:'APAC' },
  { name:'South Korea Resident Registration Number',                    guid:'5b802e18-ba80-44c4-bc83-bf2ad36ae36a', conf:'High',   group:'pii',       tag:'pii', region:'APAC' },
  { name:'New Zealand bank account number',                             guid:'1a97fc2b-dd2f-48f1-bc4e-2ddf25813956', conf:'High',   group:'financial', tag:'fin', region:'APAC' },
  // ── LATAM ──
  { name:'Brazil CPF Number',                                           guid:'78e09124-f2c3-4656-b32a-c1a132cd2711', conf:'High',   group:'pii',       tag:'pii', region:'LATAM' },
  { name:'Argentina National Identity (DNI) Number',                   guid:'eefbb00e-8282-433c-8620-8f1da3bffdb2', conf:'High',   group:'pii',       tag:'pii', region:'LATAM' },
  { name:'Mexico Unique Population Registry Code (CURP)',               guid:'e905ad4d-5a74-406d-bf36-b1efca798af4', conf:'High',   group:'pii',       tag:'pii', region:'LATAM' },
  // ── MEA ──
  { name:'Saudi Arabia National ID',                                    guid:'8c5a0ba8-404a-41a3-8871-746aa21ee6c0', conf:'High',   group:'pii',       tag:'pii', region:'MEA' },
  { name:'UAE Identity Card Number',                                    guid:'853a8051-ad90-417c-9345-c73ac0adc1c3', conf:'High',   group:'pii',       tag:'pii', region:'MEA' },
  { name:'Turkey Physical Addresses',                                   guid:'cf1d79ec-3162-49a8-9bcd-3cbeda2a3439', conf:'Medium', group:'pii',       tag:'pii', region:'MEA' },
  // ── Cloud / Credentials ──
  { name:'Azure DocumentDB Auth Key',                                   guid:'0f587d92-eb28-44a9-bd1c-90f2892b47aa', conf:'High',   group:'financial', tag:'fin', region:'Cloud' },
  { name:'Azure Storage Account Key',                                   guid:'c7bc98e8-551a-4c35-a92d-d2c8cda714a7', conf:'High',   group:'financial', tag:'fin', region:'Cloud' },
  { name:'Azure SAS',                                                   guid:'4d235014-e564-47f4-a6fb-6ebb4a826834', conf:'High',   group:'financial', tag:'fin', region:'Cloud' },
  { name:'GitHub Personal Access Token',                                guid:'927cd1e7-8377-4df3-9bc3-fabdaef94787', conf:'High',   group:'financial', tag:'fin', region:'Cloud' },
  { name:'Google API key',                                              guid:'9bea20ec-764d-4987-88a1-093bbbacadd2', conf:'High',   group:'financial', tag:'fin', region:'Cloud' },
  { name:'All Credential Types',                                        guid:'ba147552-2ed1-4a8f-a441-981e94ab1895', conf:'High',   group:'financial', tag:'fin', region:'Cloud' },
  { name:'General Password',                                            guid:'24a90d49-519b-4689-aa13-f35c47cc40c3', conf:'High',   group:'financial', tag:'fin', region:'Cloud' },
  { name:'Microsoft Entra Client Secret',                               guid:'d820a2f1-46ef-4220-957e-6eb9abc1aadb', conf:'High',   group:'financial', tag:'fin', region:'Cloud' },
  { name:'Slack Access Token',                                          guid:'1ac53bfc-5956-49ae-b4b6-7087bf0cfc88', conf:'High',   group:'financial', tag:'fin', region:'Cloud' },
  { name:'SQL Server Connection String',                                guid:'e76b6205-d3cb-46f2-bd63-c90153f2f97d', conf:'High',   group:'financial', tag:'fin', region:'Cloud' },
]

export const REGION_LABELS = {
  ZA: 'South Africa',
  Global: 'Global',
  EU: 'European Union',
  UK: 'United Kingdom',
  US: 'United States',
  APAC: 'Asia Pacific',
  LATAM: 'Latin America',
  MEA: 'Middle East & Africa',
  Cloud: 'Cloud / Credentials',
}

export const REGION_ORDER = ['ZA','Global','EU','UK','US','APAC','LATAM','MEA','Cloud']

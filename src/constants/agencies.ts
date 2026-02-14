export interface VendeurGros {
    agence: string;
    vendeur: string;
}

export const VENDEURS_GROS: VendeurGros[] = [
    { agence: "OUJDA", vendeur: "V26 LOUKILI MOHAMMED" },
    { agence: "MARRAKECH", vendeur: "979 MOUJANE MOHAMED" },
    { agence: "RABAT", vendeur: "V07 ABDELAADIM ALHAYANE" },
    { agence: "FES", vendeur: "659 EL HADI EL BACHIR" },
    { agence: "RABAT", vendeur: "203 AKRACHE ABDELAZIZ" },
    { agence: "CASA", vendeur: "545 ABDELMAJID AIT BENDRA" },
    { agence: "MARRAKECH", vendeur: "328 JDARI HAMID" },
    { agence: "CASA", vendeur: "020 ZOUHER HAFER" },
    { agence: "MARRAKECH", vendeur: "286 RAFI MOHAMED" },
    { agence: "OUJDA", vendeur: "323 BOUHOUCHE BRAHIM" },
    { agence: "AGADIR", vendeur: "420 EL MANSOURI OMAR" },
    { agence: "CASA", vendeur: "202 ZAKKAR BOUAZZAOUI" },
    { agence: "MEKNES", vendeur: "536 EL KHANTACHI MOHAMMED" },
    { agence: "TANGER", vendeur: "525 KHALID KHEIRALLAH" },
    { agence: "CASA", vendeur: "309 LAAOUANE ABDELKADER" },
    { agence: "AGADIR", vendeur: "335 ZERROUKI JAMAL" },
    { agence: "AGADIR", vendeur: "F77 EL MEZAOUARI YOUSSEF" },
    { agence: "RABAT", vendeur: "671 BOUSTTA BOUBKER" },
    { agence: "MEKNES", vendeur: "907 BOUALI AZIZ" },
    { agence: "TANGER", vendeur: "414 BOUHMADI MUSTAFA" },
    { agence: "CASA", vendeur: "015 BEN MOUYA ABDELAZIZ" },
    { agence: "TANGER", vendeur: "075 LAMINE SAID" },
];

export const CDA_LIST = [
    { agence: "FES", cda: "NOUREDDINE SOUATI" },
    { agence: "OUJDA", cda: "BENMASSAOUD NAOUFAL" },
    { agence: "RABAT", cda: "ABDERRAZAK LAHLALI" },
    { agence: "MARRAKECH", cda: "MUSTAPHA TELJAOUI" },
    { agence: "CASA", cda: "MOHAMMED CHEMAMA" },
    { agence: "AGADIR", cda: "CDA AGADIR" },
    { agence: "MEKNES", cda: "YOUSSEF JARAT" },
    { agence: "TANGER", cda: "CDA TANGER" },
];

export const AGENCES = Array.from(new Set([
    ...VENDEURS_GROS.map(v => v.agence),
    ...CDA_LIST.map(c => c.agence)
])).sort();

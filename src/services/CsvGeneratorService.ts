import { saveAs } from "file-saver";
import { BirthRecord } from "../model/BirthRecord";

interface ColumnDefinition {
  label: string;
  getValue: (birthRecord: BirthRecord) => string | null;
}
export const CSV_HEADERS: ColumnDefinition[] = [
  {
    label: "Child First Name",
    getValue: (birthRecord: BirthRecord) => birthRecord.getChildFirstName(),
  },
  {
    label: "Child Last Name",
    getValue: (birthRecord: BirthRecord) => birthRecord.getChildLastName(),
  },
  {
    label: "Child Sex",
    getValue: (birthRecord: BirthRecord) => birthRecord.getChildSex(),
  },
  {
    label: "Child MRN(s)",
    getValue: (birthRecord: BirthRecord) => birthRecord.getChildMRN(),
  },
  {
    label: "Child DoB/Delivery Date",
    getValue: (birthRecord: BirthRecord) => birthRecord.getDeliveryDate(true),
  },
  {
    label: "Child Birth Weight",
    getValue: (birthRecord: BirthRecord) =>
      birthRecord.getChildBirthWeight(true),
  },
  {
    label: "Mother First Name",
    getValue: (birthRecord: BirthRecord) => birthRecord.getMotherFirstName(),
  },
  {
    label: "Mother Last Name",
    getValue: (birthRecord: BirthRecord) => birthRecord.getMotherLastName(),
  },
  {
    label: "Mother MRN(s)",
    getValue: (birthRecord: BirthRecord) => birthRecord.getMotherMRN(),
  },
  {
    label: "Primary Payment Source",
    getValue: (birthRecord: BirthRecord) =>
      birthRecord.getPrimaryPaymentSource(),
  },
  {
    label: "Mother Race",
    getValue: (birthRecord: BirthRecord) => birthRecord.getMotherRace(),
  },
  {
    label: "Mother Height",
    getValue: (birthRecord: BirthRecord) => birthRecord.getMotherHeight(),
  },
  {
    label: "Mother Ethnicity",
    getValue: (birthRecord: BirthRecord) => birthRecord.getMotherEthnicity(),
  },
  {
    label: "Mother Address",
    getValue: (birthRecord: BirthRecord) => birthRecord.getMotherAddress(),
  },
  {
    label: "Mother Birth Date",
    getValue: (birthRecord: BirthRecord) => birthRecord.getMotherDateOfBirth(),
  },
  {
    label: "Mother Pre-Pregnancy Weight",
    getValue: (birthRecord: BirthRecord) =>
      birthRecord.getMotherWeightPrePregnancy(true),
  },
  {
    label: "Mother Weight at Delivery",
    getValue: (birthRecord: BirthRecord) =>
      birthRecord.getMotherWeightAtDelivery(true),
  },
  {
    label: "APGAR Score 1 Minute",
    getValue: (birthRecord: BirthRecord) => birthRecord.get1MinuteApgarScore(),
  },
  {
    label: "APGAR Score 5 Minutes",
    getValue: (birthRecord: BirthRecord) => birthRecord.get5MinuteApgarScore(),
  },
  {
    label: "APGAR Score 10 Minutes",
    getValue: (birthRecord: BirthRecord) => birthRecord.get10MinuteApgarScore(),
  },
  {
    label: "Infant Living?",
    getValue: (birthRecord: BirthRecord) => birthRecord.getInfantLiving(),
  },
  {
    label: "Pre-Pregnancy Diabetes",
    getValue: (birthRecord: BirthRecord) =>
      birthRecord.getPrePregnancyDiabetes(true),
  },
  {
    label: "Pre-Pregnancy Hypertension",
    getValue: (birthRecord: BirthRecord) =>
      birthRecord.getPrePregnancyHypertension(true),
  },
  {
    label: "Gestational Diabetes",
    getValue: (birthRecord: BirthRecord) =>
      birthRecord.getGestationalDiabetes(true),
  },
  {
    label: "Gestational Hypertension",
    getValue: (birthRecord: BirthRecord) =>
      birthRecord.getGestationalHypertension(true),
  },
  {
    label: "Eclampsia",
    getValue: (birthRecord: BirthRecord) => birthRecord.getEclampsia(true),
  },
  {
    label: "Previous Preterm Birth",
    getValue: (birthRecord: BirthRecord) =>
      birthRecord.getPreviousPretermBirth(true),
  },
  {
    label: "Induction of Labor",
    getValue: (birthRecord: BirthRecord) =>
      birthRecord.getInductionOfLabor(true),
  },
  {
    label: "Augmentation of Labor",
    getValue: (birthRecord: BirthRecord) =>
      birthRecord.getAugmentationOfLabor(true),
  },
  {
    label: "Antibiotics Received by Mother During Labor",
    getValue: (birthRecord: BirthRecord) =>
      birthRecord.getMotherAntibioticsDuringLabor(true),
  },
  {
    label: "Epidural",
    getValue: (birthRecord: BirthRecord) => birthRecord.getEpidural(true),
  },
  {
    label: "Fetal Presentation at Birth",
    getValue: (birthRecord: BirthRecord) => birthRecord.getFetalPresentation(),
  },
  {
    label: "Final Route/Method of Delivery",
    getValue: (birthRecord: BirthRecord) =>
      birthRecord.getFinalRouteMethodDelivery(),
  },
  {
    label: "Ruptured Uterus",
    getValue: (birthRecord: BirthRecord) => birthRecord.getRupturedUterus(true),
  },
  {
    label: "Maternal Transfusion",
    getValue: (birthRecord: BirthRecord) =>
      birthRecord.getMaternalTransfusion(true),
  },
  {
    label: "Mother ICU Admission",
    getValue: (birthRecord: BirthRecord) =>
      birthRecord.getMaternalIcuAdmission(true),
  },
  {
    label: "Perineal Lacerations",
    getValue: (birthRecord: BirthRecord) =>
      birthRecord.getPerinealLacerations(true),
  },
  {
    label: "Unplanned Hysterectomy",
    getValue: (birthRecord: BirthRecord) =>
      birthRecord.getUnplannedHysterectomy(true),
  },
  {
    label: "NICU Admission",
    getValue: (birthRecord: BirthRecord) => birthRecord.getNicuAdmission(true),
  },
  {
    label: "Immediate Assisted Ventilation",
    getValue: (birthRecord: BirthRecord) =>
      birthRecord.getAssistedVentilationAfterDelivery(true),
  },
  {
    label: "Assisted Ventilation (6 hrs)",
    getValue: (birthRecord: BirthRecord) =>
      birthRecord.getAssistedVentilation6HoursAfterDelivery(true),
  },
  {
    label: "Surfactant Therapy",
    getValue: (birthRecord: BirthRecord) =>
      birthRecord.getSurfactantTherapy(true),
  },
  {
    label: "Newborn Seizure Therapy",
    getValue: (birthRecord: BirthRecord) => birthRecord.getNewbornSeizure(true),
  },
  {
    label: "Newborn Antibiotics",
    getValue: (birthRecord: BirthRecord) =>
      birthRecord.getNewbornAntibiotics(true),
  },
  {
    label: "Gestational Age",
    getValue: (birthRecord: BirthRecord) => birthRecord.getGestationalAge(),
  },
  {
    label: "Plurality",
    getValue: (birthRecord: BirthRecord) => birthRecord.getPlurality(),
  },
  {
    label: "Previous Cesareans",
    getValue: (birthRecord: BirthRecord) => birthRecord.getPreviousCesareans(),
  },
  {
    label: "Congenital Anomalies NONE",
    getValue: (birthRecord: BirthRecord) =>
      birthRecord.getCongenitalAnomaliesNone(true),
  },
  {
    label: "Anencephaly",
    getValue: (birthRecord: BirthRecord) => birthRecord.getAnencephaly(true),
  },
  {
    label: "Mening/Spina Bifida",
    getValue: (birthRecord: BirthRecord) =>
      birthRecord.getMeningomyeloceleSpinaBifida(true),
  },
  {
    label: "CCHD",
    getValue: (birthRecord: BirthRecord) => birthRecord.getCchd(true),
  },
  {
    label: "Diaphragmatic Hernia",
    getValue: (birthRecord: BirthRecord) =>
      birthRecord.getDiaphragmaticHernia(true),
  },
  {
    label: "Omphalocele",
    getValue: (birthRecord: BirthRecord) => birthRecord.getOmphalocele(true),
  },
  {
    label: "Gastroschisis",
    getValue: (birthRecord: BirthRecord) => birthRecord.getGastroschisis(true),
  },
  {
    label: "Limb Reduction",
    getValue: (birthRecord: BirthRecord) => birthRecord.getLimbReduction(true),
  },
  {
    label: "Cleft Palate Alone",
    getValue: (birthRecord: BirthRecord) =>
      birthRecord.getCleftPalateAlone(true),
  },
  {
    label: "Cleft Lip (w or w/o palate",
    getValue: (birthRecord: BirthRecord) => birthRecord.getCleftLip(true),
  },
  {
    label: "Hypospadias",
    getValue: (birthRecord: BirthRecord) => birthRecord.getHypospadias(true),
  },
  {
    label: "Down Syndrome",
    getValue: (birthRecord: BirthRecord) => birthRecord.getDownSyndrome(true),
  },
  {
    label: "Down Syndrome Karyotype Confirmed",
    getValue: (birthRecord: BirthRecord) =>
      birthRecord.getDownSyndromeKaryotypeConfirmed(),
  },
  {
    label: "Chromosomal Anomaly",
    getValue: (birthRecord: BirthRecord) =>
      birthRecord.getChromosomalAnomaly(true),
  },
  {
    label: "Chromosomal Anomaly Karyotype Confirmed",
    getValue: (birthRecord: BirthRecord) =>
      birthRecord.getChromosomalAnomalyKaryotypeConfirmed(),
  },
  {
    label: "Chlamydia Infection",
    getValue: (birthRecord: BirthRecord) => birthRecord.getChlamydia(),
  },
  {
    label: "Cytomeglovirus Infection",
    getValue: (birthRecord: BirthRecord) => birthRecord.getCytomeglovirus(),
  },
  {
    label: "Group B Strep Infection",
    getValue: (birthRecord: BirthRecord) => birthRecord.getGroupBStrep(),
  },
  {
    label: "Herpes Infection",
    getValue: (birthRecord: BirthRecord) => birthRecord.getHerpes(),
  },
  {
    label: "Gonorrhea Infection",
    getValue: (birthRecord: BirthRecord) => birthRecord.getGonorrhea(),
  },
  {
    label: "Hepatitis A Infection",
    getValue: (birthRecord: BirthRecord) => birthRecord.getHepatitisA(),
  },
  {
    label: "Hepatitis B Infection",
    getValue: (birthRecord: BirthRecord) => birthRecord.getHepatitisB(),
  },
  {
    label: "Hepatitis C Infection",
    getValue: (birthRecord: BirthRecord) => birthRecord.getHepatitisC(),
  },
  {
    label: "HIV/AIDS Infection",
    getValue: (birthRecord: BirthRecord) => birthRecord.getHivAids(),
  },
  {
    label: "Syphilis Infection",
    getValue: (birthRecord: BirthRecord) => birthRecord.getSyphilis(),
  },
  {
    label: "Zika Infection",
    getValue: (birthRecord: BirthRecord) => birthRecord.getZika(),
  },
];

export class CsvGeneratorService {
  public static generateBirthRecordsCSV(birthRecords: BirthRecord[]): void {
    const csvRows: string[] = birthRecords.map((birthRecord) => {
      const csvRowValues = this.getBirthRecordCsvValues(birthRecord);
      const escapedRowValues = csvRowValues.map((value) =>
        value === null
          ? ""
          : value.indexOf(",") >= 0
          ? '"' + value + '"'
          : value
      );
      return escapedRowValues.join();
    });
    csvRows.unshift(CSV_HEADERS.map((header) => header.label).join());
    const csvArray = csvRows.join("\r\n");

    // Download the CSV
    const blob = new Blob([csvArray], { type: "text/csv" });
    saveAs(blob, "bfdr-v1-results.csv");
  }

  public static getBirthRecordCsvValues(
    birthRecord: BirthRecord
  ): (string | null)[] {
    return CSV_HEADERS.map((header) => header.getValue(birthRecord));
  }
}

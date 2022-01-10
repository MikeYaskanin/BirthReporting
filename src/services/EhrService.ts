import { BirthRecord } from "../model/BirthRecord";
import { DataRequest, DataRequestDescription } from "../model/DataRequest";
import { FhirHttp } from "../config/AxiosConfig";

export class EhrService {
  private static getPatientWithIdentifier(
    idSystem: string,
    idValue: string,
    description: DataRequestDescription
  ): Promise<DataRequest<fhir4.Patient>> {
    const resourcePath = "/Patient?identifier=" + idSystem + "|" + idValue;
    return FhirHttp.get<fhir4.Bundle>(resourcePath)
      .then((response) => {
        if (!response.data.entry || response.data.entry.length !== 1) {
          throw new Error(
            description + " search did not return single patient"
          );
        }

        return {
          requestUrl: resourcePath,
          description,
          responseData: response.data.entry[0].resource as fhir4.Patient,
        };
      })
      .catch((err) => {
        return {
          requestUrl: resourcePath,
          description,
          error: err,
        };
      });
  }

  public static getChildPatientDetails(
    mrnRecord: BirthRecord
  ): Promise<DataRequest<fhir4.Patient>> {
    return this.getPatientWithIdentifier(
      "urn:oid:2.16.840.1.113883.6.1000",
      mrnRecord.childMrn,
      "Child Patient Resource"
    );
  }

  public static getMotherPatientFromChildRelatedPersons(
    relatedPersons: fhir4.RelatedPerson[] | undefined
  ): Promise<DataRequest<fhir4.Patient>> {
    if (!relatedPersons || relatedPersons.length === 0) {
      return Promise.resolve({
        requestUrl: "No request made",
        description: "Birth Parent Patient Resource",
        error: "No related persons found",
      });
    }

    // This is disgusting. FHIR is usually nice, but this is an awful mess of code to determine if someone is the mother
    const birthParent = relatedPersons.find((relatedPerson) => {
      const isMother =
        relatedPerson.relationship &&
        relatedPerson.relationship.find(
          (relationship) =>
            relationship.extension &&
            relationship.extension.find(
              (relationExtension) =>
                relationExtension.valueCodeableConcept?.coding &&
                relationExtension.valueCodeableConcept.coding.find(
                  (relationCoding) =>
                    // Two possible codes shown in sandbox to determine if someone is the mother
                    (relationCoding.system ===
                      "http://terminology.hl7.org/CodeSystem/v3-RoleCode" &&
                      relationCoding.code === "MTH") ||
                    (relationCoding.system ===
                      "https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/40" &&
                      relationCoding.code === "156")
                )
            )
        );
      return isMother;
    });

    if (!birthParent) {
      return Promise.resolve({
        requestUrl: "No request made",
        description: "Birth Parent Patient Resource",
        error: "No birth parent found in related persons",
      });
    }

    // You can search on any patient identifier, just grab the first complete one
    const identifierForSearch =
      birthParent.identifier &&
      birthParent.identifier.find(
        (identifier) => identifier.system && identifier.value
      );

    if (!identifierForSearch) {
      return Promise.resolve({
        requestUrl: "No request made",
        description: "Birth Parent Patient Resource",
        error: "No identifier found on birth parent",
      });
    }

    return this.getPatientWithIdentifier(
      identifierForSearch.system as string,
      identifierForSearch.value as string,
      "Birth Parent Patient Resource"
    );
  }

  private static getObservationForPatientSystemCode(
    patient: fhir4.Patient | null,
    description: DataRequestDescription,
    system = "",
    code = ""
  ): Promise<DataRequest<fhir4.Observation[]>> {
    if (!patient) {
      throw new Error("Patient required for " + description);
    }
    const resourcePath =
      "/Observation?patient=" + patient.id + "&code=" + system + "|" + code;

    return FhirHttp.get<fhir4.Bundle>(resourcePath)
      .then((response) => {
        if (!response.data.entry) {
          throw new Error(
            "Observation did not return any results for " + description
          );
        }

        return {
          requestUrl: resourcePath,
          description,
          responseData: response.data.entry.map(
            (entry) => entry.resource as fhir4.Observation
          ),
        };
      })
      .catch((err) => {
        return {
          requestUrl: resourcePath,
          description,
          error: err,
          responseData: undefined,
        };
      });
  }

  private static getConditionsForPatient(
    patient: fhir4.Patient | null,
    description: DataRequestDescription
  ): Promise<DataRequest<fhir4.Condition[]>> {
    if (!patient) {
      throw new Error("Patient required for " + description);
    }
    const resourcePath =
      "/Condition?patient=" + patient.id + "&clinical-status=active";

    return FhirHttp.get<fhir4.Bundle>(resourcePath)
      .then((response) => {
        if (!response.data.entry) {
          throw new Error(
            "Condition did not return any results for " + description
          );
        }

        return {
          requestUrl: resourcePath,
          description,
          responseData: response.data.entry.map(
            (entry) => entry.resource as fhir4.Condition
          ),
        };
      })
      .catch((err) => {
        return {
          requestUrl: resourcePath,
          description,
          error: err,
          responseData: undefined,
        };
      });
  }

  private static getProceduresForPatient(
    patient: fhir4.Patient | null,
    description: DataRequestDescription
  ): Promise<DataRequest<fhir4.Procedure[]>> {
    if (!patient) {
      throw new Error("Patient required for " + description);
    }
    const resourcePath = "/Procedure?patient=" + patient.id;

    return FhirHttp.get<fhir4.Bundle>(resourcePath)
      .then((response) => {
        if (!response.data.entry) {
          throw new Error(
            "Condition did not return any results for " + description
          );
        }

        return {
          requestUrl: resourcePath,
          description,
          responseData: response.data.entry.map(
            (entry) => entry.resource as fhir4.Procedure
          ),
        };
      })
      .catch((err) => {
        return {
          requestUrl: resourcePath,
          description,
          error: err,
          responseData: undefined,
        };
      });
  }

  private static getCoveragesForPatient(
    patient: fhir4.Patient | null,
    description: DataRequestDescription
  ): Promise<DataRequest<fhir4.Coverage[]>> {
    if (!patient) {
      throw new Error("Patient required for " + description);
    }
    const resourcePath = "/Coverage?patient=" + patient.id;

    return FhirHttp.get<fhir4.Bundle>(resourcePath)
      .then((response) => {
        if (!response.data.entry) {
          throw new Error(
            "Coverage did not return any results for " + description
          );
        }

        return {
          requestUrl: resourcePath,
          description,
          responseData: response.data.entry.map(
            (entry) => entry.resource as fhir4.Coverage
          ),
        };
      })
      .catch((err) => {
        return {
          requestUrl: resourcePath,
          description,
          error: err,
          responseData: undefined,
        };
      });
  }

  public static getMotherConditions(
    birthRecord: BirthRecord
  ): Promise<DataRequest<fhir4.Condition[]>> {
    return this.getConditionsForPatient(
      birthRecord.getMotherPatient(),
      "Mother Conditions"
    );
  }

  public static getChildConditions(
    birthRecord: BirthRecord
  ): Promise<DataRequest<fhir4.Condition[]>> {
    return this.getConditionsForPatient(
      birthRecord.getChildPatient(),
      "Child Conditions"
    );
  }

  public static getMotherProcedures(
    birthRecord: BirthRecord
  ): Promise<DataRequest<fhir4.Procedure[]>> {
    return this.getProceduresForPatient(
      birthRecord.getMotherPatient(),
      "Mother Procedures"
    );
  }

  public static getChildProcedures(
    birthRecord: BirthRecord
  ): Promise<DataRequest<fhir4.Procedure[]>> {
    return this.getProceduresForPatient(
      birthRecord.getChildPatient(),
      "Child Procedures"
    );
  }

  public static get10MinuteApgarScoreObservations(
    birthRecord: BirthRecord
  ): Promise<DataRequest<fhir4.Observation[]>> {
    return this.getObservationForPatientSystemCode(
      birthRecord.getChildPatient(),
      "Apgar Score 10 Minutes",
      "http://loinc.org",
      "9271-8"
    );
  }

  public static get5MinuteApgarScoreObservations(
    birthRecord: BirthRecord
  ): Promise<DataRequest<fhir4.Observation[]>> {
    return this.getObservationForPatientSystemCode(
      birthRecord.getChildPatient(),
      "Apgar Score 5 Minutes",
      "http://loinc.org",
      "9274-2"
    );
  }

  public static get1MinuteApgarScoreObservations(
    birthRecord: BirthRecord
  ): Promise<DataRequest<fhir4.Observation[]>> {
    return this.getObservationForPatientSystemCode(
      birthRecord.getChildPatient(),
      "Apgar Score 1 Minute",
      "http://loinc.org",
      "9272-6"
    );
  }

  public static getInfantLivingObservations(
    birthRecord: BirthRecord
  ): Promise<DataRequest<fhir4.Observation[]>> {
    return this.getObservationForPatientSystemCode(
      birthRecord.getChildPatient(),
      "Infant Living?",
      "http://loinc.org",
      "73757-7"
    );
  }

  public static getMotherWeightObservations(
    birthRecord: BirthRecord
  ): Promise<DataRequest<fhir4.Observation[]>> {
    return this.getObservationForPatientSystemCode(
      birthRecord.getMotherPatient(),
      "Mother Weight",
      "http://loinc.org",
      "29463-7"
    );
  }

  public static getMotherHeightObservations(
    birthRecord: BirthRecord
  ): Promise<DataRequest<fhir4.Observation[]>> {
    return this.getObservationForPatientSystemCode(
      birthRecord.getMotherPatient(),
      "Mother Height",
      "http://loinc.org",
      "3137-7"
    );
  }

  public static getPrincipalPaymentObservations(
    birthRecord: BirthRecord
  ): Promise<DataRequest<fhir4.Coverage[]>> {
    return this.getCoveragesForPatient(
      birthRecord.getMotherPatient(),
      "Mother Coverage"
    );
  }

  public static getMotherDeliveryWeightObservations(
    birthRecord: BirthRecord
  ): Promise<DataRequest<fhir4.Observation[]>> {
    return this.getObservationForPatientSystemCode(
      birthRecord.getMotherPatient(),
      "Mother Delivery Weight",
      "http://loinc.org",
      "69461-2"
    );
  }

  public static getMotherPrePregnancyWeightObservations(
    birthRecord: BirthRecord
  ): Promise<DataRequest<fhir4.Observation[]>> {
    return this.getObservationForPatientSystemCode(
      birthRecord.getMotherPatient(),
      "Mother Pre-Pregnancy Weight",
      "http://loinc.org",
      "56077-1"
    );
  }

  public static getMotherPregnancyRiskFactorObservations(
    birthRecord: BirthRecord
  ): Promise<DataRequest<fhir4.Observation[]>> {
    return this.getObservationForPatientSystemCode(
      birthRecord.getMotherPatient(),
      "Mother's Risk Factors Observations",
      "http://loinc.org",
      "73775-9"
    );
  }

  public static getCharacteristicsLaborDeliveryObservations(
    birthRecord: BirthRecord
  ): Promise<DataRequest<fhir4.Observation[]>> {
    return this.getObservationForPatientSystemCode(
      birthRecord.getMotherPatient(),
      "Characteristics of Labor/Delivery Observations",
      "http://loinc.org",
      "73813-8"
    );
  }

  public static getTrialOfLaborAttemptedObservations(
    birthRecord: BirthRecord
  ): Promise<DataRequest<fhir4.Observation[]>> {
    return this.getObservationForPatientSystemCode(
      birthRecord.getMotherPatient(),
      "Trial of Labor Attempted",
      "http://loinc.org",
      "73760-1"
    );
  }

  public static getMaternalMorbidityObservations(
    birthRecord: BirthRecord
  ): Promise<DataRequest<fhir4.Observation[]>> {
    return this.getObservationForPatientSystemCode(
      birthRecord.getMotherPatient(),
      "Maternal Morbidity Observations",
      "http://loinc.org",
      "73781-7"
    );
  }

  public static getPreviousCesareansObservations(
    birthRecord: BirthRecord
  ): Promise<DataRequest<fhir4.Observation[]>> {
    return this.getObservationForPatientSystemCode(
      birthRecord.getMotherPatient(),
      "Previous Cesareans",
      "http://loinc.org",
      "68497-7"
    );
  }

  public static getPluralityObservations(
    birthRecord: BirthRecord
  ): Promise<DataRequest<fhir4.Observation[]>> {
    return this.getObservationForPatientSystemCode(
      birthRecord.getMotherPatient(),
      "Multiple Birth Indicator",
      "http://loinc.org",
      "57722-1"
    );
  }

  public static getPregnancyInfectionsObservations(
    birthRecord: BirthRecord
  ): Promise<DataRequest<fhir4.Observation[]>> {
    return this.getObservationForPatientSystemCode(
      birthRecord.getMotherPatient(),
      "Infections During Pregnancy",
      "http://loinc.org",
      "72519-2"
    );
  }

  public static getGestationalAgeObservations(
    birthRecord: BirthRecord
  ): Promise<DataRequest<fhir4.Observation[]>> {
    return this.getObservationForPatientSystemCode(
      birthRecord.getChildPatient(),
      "Gestational Age",
      "http://loinc.org",
      "11884-4"
    );
  }

  public static getCongenitalAnomaliesObservations(
    birthRecord: BirthRecord
  ): Promise<DataRequest<fhir4.Observation[]>> {
    return this.getObservationForPatientSystemCode(
      birthRecord.getChildPatient(),
      "Congenital Anomalies",
      "http://loinc.org",
      "73780-9"
    );
  }

  public static getChildWeightObservations(
    birthRecord: BirthRecord
  ): Promise<DataRequest<fhir4.Observation[]>> {
    return this.getObservationForPatientSystemCode(
      birthRecord.getChildPatient(),
      "Child Weight",
      "http://loinc.org",
      "29463-7"
    );
  }

  public static getChildBirthWeightObservations(
    birthRecord: BirthRecord
  ): Promise<DataRequest<fhir4.Observation[]>> {
    return this.getObservationForPatientSystemCode(
      birthRecord.getChildPatient(),
      "Child Birth Weight",
      "http://loinc.org",
      "8339-4"
    );
  }

  public static getChildDownSyndromeKaryotypeObservations(
    birthRecord: BirthRecord
  ): Promise<DataRequest<fhir4.Observation[]>> {
    return this.getObservationForPatientSystemCode(
      birthRecord.getChildPatient(),
      "Down Syndrome Karyotype",
      "http://loinc.org",
      "73778-3"
    );
  }

  public static getChildChromosomalAnomalyKaryotypeObservations(
    birthRecord: BirthRecord
  ): Promise<DataRequest<fhir4.Observation[]>> {
    return this.getObservationForPatientSystemCode(
      birthRecord.getChildPatient(),
      "Chromosomal Anomaly Karyotype",
      "http://loinc.org",
      "73778-8"
    );
  }

  public static getAbnormalNewbornObservations(
    birthRecord: BirthRecord
  ): Promise<DataRequest<fhir4.Observation[]>> {
    return this.getObservationForPatientSystemCode(
      birthRecord.getChildPatient(),
      "Abnormal Newborn Conditions",
      "http://loinc.org",
      "73812-0"
    );
  }

  public static getFetalPresentationObservations(
    birthRecord: BirthRecord
  ): Promise<DataRequest<fhir4.Observation[]>> {
    return this.getObservationForPatientSystemCode(
      birthRecord.getChildPatient(),
      "Child Birth Weight",
      "http://loinc.org",
      "73761-9"
    );
  }

  public static getDeliveryDateObservations(
    birthRecord: BirthRecord
  ): Promise<DataRequest<fhir4.Observation[]>> {
    return this.getObservationForPatientSystemCode(
      birthRecord.getChildPatient(),
      "Delivery Date",
      "http://loinc.org",
      "11778-8"
    );
  }

  public static getRelatedPeopleForPatient(
    patient: fhir4.Patient | null
  ): Promise<DataRequest<fhir4.RelatedPerson[]>> {
    const description: DataRequestDescription = "Related Persons";
    if (!patient) {
      throw new Error("Patient required for " + description);
    }
    const resourcePath =
      "/RelatedPerson?patient=" + patient.id + "&-relationship-level=Patient";

    return FhirHttp.get<fhir4.Bundle>(resourcePath)
      .then((response) => {
        if (!response.data.entry) {
          throw new Error(
            "RelatedPerson did not return any results for " + description
          );
        }

        return {
          requestUrl: resourcePath,
          description,
          responseData: response.data.entry.map(
            (entry) => entry.resource as fhir4.RelatedPerson
          ),
        };
      })
      .catch((err) => {
        return {
          requestUrl: resourcePath,
          description,
          error: err,
          responseData: undefined,
        };
      });
  }
}

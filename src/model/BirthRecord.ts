import moment from "moment";
import { DataRequest, DataRequestDescription } from "./DataRequest";
export class BirthRecord {
  dataRequests: DataRequest<fhir4.Resource | fhir4.Resource[]>[];
  childMrn: string;
  motherMrn: string;
  status: "In progress" | "Not started" | "Error" | "Complete";
  selected: boolean;

  public constructor() {
    this.dataRequests = [];
    this.childMrn = "";
    this.motherMrn = "";
    this.status = "Not started";
    this.selected = true;
  }

  public getChildPatient(): fhir4.Patient | null {
    return this.dataRequests.find(
      (request) => request.description === "Child Patient Resource"
    )?.responseData as fhir4.Patient;
  }

  public getMotherPatient(): fhir4.Patient | null {
    return this.dataRequests.find(
      (request) => request.description === "Birth Parent Patient Resource"
    )?.responseData as fhir4.Patient;
  }

  private getPatientFirstName(patient: fhir4.Patient | null): string | null {
    if (!patient) {
      return null;
    }
    const patientNames = patient.name;
    if (
      !patientNames ||
      patientNames.length === 0 ||
      !patientNames[0].given ||
      patientNames[0].given.length === 0
    ) {
      return null;
    }
    return patientNames[0].given[0];
  }

  public getPatientLastName(patient: fhir4.Patient | null): string | null {
    if (!patient) {
      return null;
    }
    const patientNames = patient.name;
    if (!patientNames || patientNames.length === 0 || !patientNames[0].family) {
      return null;
    }
    return patientNames[0].family;
  }

  public getChildFirstName(): string | null {
    return this.getPatientFirstName(this.getChildPatient());
  }

  public getMotherFirstName(): string | null {
    return this.getPatientFirstName(this.getMotherPatient());
  }

  public getChildLastName(): string | null {
    return this.getPatientLastName(this.getChildPatient());
  }

  public getMotherLastName(): string | null {
    return this.getPatientLastName(this.getMotherPatient());
  }

  public getChildSex(): NonNullable<fhir4.Patient["gender"]> | null {
    const childPatient = this.getChildPatient();
    if (!childPatient) {
      return null;
    }
    return childPatient.gender || null;
  }

  public getPatientMRNs(patient: fhir4.Patient | null): string | null {
    if (!patient) {
      return null;
    }
    const patientIdentifiers = patient.identifier;

    if (!patientIdentifiers) {
      return null;
    }

    const mrns: string[] = patientIdentifiers
      .filter(
        (identifier) =>
          identifier.value &&
          identifier.type?.coding?.find(
            (coding) =>
              coding.code === "MR" &&
              coding.system === "http://terminology.hl7.org/CodeSystem/v2-0203"
          )
      )
      .map((identifier) => identifier.value || "");
    return mrns.join(", ");
  }

  public getChildMRN(): string | null {
    return this.getPatientMRNs(this.getChildPatient());
  }

  public getMotherMRN(): string | null {
    return this.getPatientMRNs(this.getMotherPatient());
  }

  public getPatientRace(patient: fhir4.Patient | null): string | null {
    if (!patient) {
      return null;
    }
    const patientExtensions = patient.extension;

    if (!patientExtensions) {
      return null;
    }

    const raceExtension = patientExtensions.find(
      (extension) =>
        extension.url ===
        "http://hl7.org/fhir/us/core/StructureDefinition/us-core-race"
    );

    if (!raceExtension || !raceExtension.extension) {
      return null;
    }

    return raceExtension.extension
      .filter((raceExt) => raceExt.valueCoding)
      .map(
        (raceExt) =>
          raceExt.valueCoding?.code + "/" + raceExt.valueCoding?.display
      )
      .join(", ");
  }

  public getMotherRace(): string | null {
    return this.getPatientRace(this.getMotherPatient());
  }

  public getPatientEthnicity(patient: fhir4.Patient | null): string | null {
    if (!patient) {
      return null;
    }
    const patientExtensions = patient.extension;

    if (!patientExtensions) {
      return null;
    }

    const ethnicityExtension = patientExtensions.find(
      (extension) =>
        extension.url ===
        "http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity"
    );

    if (!ethnicityExtension || !ethnicityExtension.extension) {
      return null;
    }

    return ethnicityExtension.extension
      .filter((ethnicityExt) => ethnicityExt.valueCoding)
      .map(
        (ethnicityExt) =>
          ethnicityExt.valueCoding?.code +
          "/" +
          ethnicityExt.valueCoding?.display
      )
      .join(", ");
  }

  private getPatientAddress(patient: fhir4.Patient | null): string | null {
    if (!patient) {
      return null;
    }
    const patientAddresses = patient.address;

    if (!patientAddresses) {
      return null;
    }
    const addresses: string[] = patientAddresses
      .filter((address) => address.text)
      .map((address) => address.text || "");
    return addresses.join(" | ");
  }

  public getMotherAddress(): string | null {
    return this.getPatientAddress(this.getMotherPatient());
  }

  public getMotherHeight(): string | null {
    const observations = this.getObservationsWithDescription("Mother Height");
    if (!observations || !observations.length) {
      return null;
    }
    observations.sort(
      (obsA, obsB) =>
        obsA.effectiveDateTime?.localeCompare(obsB.effectiveDateTime || "") ||
        -1
    );
    return this.getObservationValueQuantities([
      observations[observations.length - 1],
    ]);
  }

  public getPatientDateOfBirth(patient: fhir4.Patient | null): string | null {
    return patient?.birthDate || null;
  }

  public getDeliveryDate(includeSource = false): string | null {
    // Check for official observation of delivery date
    const observations = this.getObservationsWithDescription("Delivery Date");

    if (observations && observations.length) {
      const deliveryDate = observations
        .map((observation) => observation.valueDateTime)
        .join(", ");
      if (deliveryDate) {
        return (
          deliveryDate +
          (includeSource ? " (from delivery date observation)" : "")
        );
      }
    }

    // Use the date of birth if no delivery date found
    const childDob = this.getPatientDateOfBirth(this.getChildPatient());
    if (childDob) {
      return childDob + (includeSource ? " (from child date of birth)" : "");
    }
    return null;
  }

  public getMotherDateOfBirth(): string | null {
    return this.getPatientDateOfBirth(this.getMotherPatient());
  }

  public getMotherEthnicity(): string | null {
    return this.getPatientEthnicity(this.getMotherPatient());
  }

  private getObservationsWithDescription(
    requestDescription: DataRequestDescription
  ): fhir4.Observation[] {
    return this.dataRequests.find(
      (request) => request.description === requestDescription
    )?.responseData as fhir4.Observation[];
  }

  private getConditionsWithDescription(
    requestDescription: DataRequestDescription
  ): fhir4.Condition[] {
    return this.dataRequests.find(
      (request) => request.description === requestDescription
    )?.responseData as fhir4.Condition[];
  }

  private getProceduresWithDescription(
    requestDescription: DataRequestDescription
  ): fhir4.Procedure[] {
    return this.dataRequests.find(
      (request) => request.description === requestDescription
    )?.responseData as fhir4.Procedure[];
  }

  private getObservationValueIntegers(
    observations: fhir4.Observation[]
  ): string | null {
    if (observations && observations.length) {
      return observations
        .map((observation) => observation.valueInteger)
        .join(", ");
    }
    return null;
  }

  private getObservationValueQuantities(
    observations: fhir4.Observation[]
  ): string | null {
    if (observations && observations.length) {
      return observations
        .map((observation) => {
          if (
            observation.valueQuantity?.value &&
            observation.valueQuantity.unit
          ) {
            return (
              observation.valueQuantity.value + observation.valueQuantity.unit
            );
          } else if (observation.valueQuantity?.value) {
            return observation.valueQuantity.value;
          }
        })
        .join(", ");
    }
    return null;
  }

  private getObservationValueBooleans(
    requestDescription: DataRequestDescription
  ): string | null {
    const observations = this.getObservationsWithDescription(
      requestDescription
    );

    if (observations && observations.length) {
      return observations
        .map((observation) => observation.valueBoolean)
        .join(", ");
    }
    return null;
  }

  public get10MinuteApgarScore(): string | null {
    return this.getObservationValueQuantities(
      this.getObservationsWithDescription("Apgar Score 10 Minutes")
    );
  }

  public get5MinuteApgarScore(): string | null {
    return this.getObservationValueQuantities(
      this.getObservationsWithDescription("Apgar Score 5 Minutes")
    );
  }

  public get1MinuteApgarScore(): string | null {
    return this.getObservationValueQuantities(
      this.getObservationsWithDescription("Apgar Score 1 Minute")
    );
  }

  public getInfantLiving(): string | null {
    return this.getObservationValueBooleans("Infant Living?");
  }

  public getChildBirthWeight(includeSource = false): string | null {
    // Check specific birth weight observation first
    const specificBirthWeight = this.getObservationValueQuantities(
      this.getObservationsWithDescription("Child Birth Weight")
    );
    if (specificBirthWeight) {
      return (
        specificBirthWeight +
        (includeSource ? " (from birth weight observation)" : "")
      );
    }

    const observations = this.getObservationsWithDescription("Child Weight");

    if (observations && observations.length) {
      // Return the earliest observed weight for birth weight
      observations.sort(
        (observationA, observationB) =>
          observationA.effectiveDateTime?.localeCompare(
            observationB.effectiveDateTime || ""
          ) || -1
      );
      const birthWeight = this.getObservationValueQuantities([observations[0]]);
      if (birthWeight) {
        return (
          birthWeight +
          (includeSource
            ? " (from general weight observations on " +
              moment(observations[0].effectiveDateTime).format() +
              ")"
            : "")
        );
      }
    }
    return null;
  }

  public getMotherWeightAtDelivery(includeSource = false): string | null {
    // Try to get weight from specific delivery weight observation first
    const specificDeliveryWeight = this.getObservationValueQuantities(
      this.getObservationsWithDescription("Mother Delivery Weight")
    );

    if (specificDeliveryWeight) {
      return (
        specificDeliveryWeight +
        (includeSource ? " (from delivery weight observation)" : "")
      );
    }

    // If no delivery weight found, use general weight observations
    const observations = this.getObservationsWithDescription("Mother Weight");

    if (observations && observations.length) {
      // Return the latest observed weight that becomes before the delivery date and after pregnancy began
      const deliveryDate = moment(this.getDeliveryDate());
      if (!deliveryDate.isValid()) {
        return null;
      }
      const nineMonthsBeforeDelivery = moment(deliveryDate).subtract(
        9,
        "months"
      );
      const weightsDuringPregnancy = observations
        .filter(
          (weightObs) =>
            weightObs.effectiveDateTime &&
            moment(weightObs.effectiveDateTime).isSameOrBefore(deliveryDate) &&
            moment(weightObs.effectiveDateTime).isAfter(
              nineMonthsBeforeDelivery
            )
        )
        .sort(
          (observationA, observationB) =>
            observationA.effectiveDateTime?.localeCompare(
              observationB.effectiveDateTime || ""
            ) || -1
        );

      if (weightsDuringPregnancy.length) {
        const deliveryWeightObservation =
          weightsDuringPregnancy[weightsDuringPregnancy.length - 1];
        const deliveryWeight = this.getObservationValueQuantities([
          deliveryWeightObservation,
        ]);
        if (deliveryWeight) {
          return (
            deliveryWeight +
            (includeSource
              ? " (from general weight observations " +
                moment(deliveryWeightObservation.effectiveDateTime).format() +
                ")"
              : "")
          );
        }
      }
    }

    return null;
  }

  public getMotherWeightPrePregnancy(includeSource = false): string | null {
    // Try to get weight from specific delivery weight observation first
    const specificPrePregnancyWeight = this.getObservationValueQuantities(
      this.getObservationsWithDescription("Mother Pre-Pregnancy Weight")
    );

    if (specificPrePregnancyWeight) {
      return (
        specificPrePregnancyWeight +
        (includeSource ? " (from pre-pregnancy weight observation)" : "")
      );
    }

    // If no prepregnancy weight found, look in general weight observations
    // and get the latest observed weight that becomes from ~9 months before delivery?
    // TODO: Use the gestation age instead of 9 months?
    const observations = this.getObservationsWithDescription("Mother Weight");
    if (observations && observations.length) {
      const deliveryDate = moment(this.getDeliveryDate());
      if (!deliveryDate.isValid()) {
        return null;
      }
      const nineMonthsBeforeDelivery = moment(deliveryDate).subtract(
        9,
        "months"
      );
      const weightsBeforePregnancy = observations
        .filter(
          (weightObs) =>
            deliveryDate &&
            weightObs.effectiveDateTime &&
            moment(weightObs.effectiveDateTime).isBefore(
              nineMonthsBeforeDelivery
            )
        )
        .sort(
          (observationA, observationB) =>
            observationA.effectiveDateTime?.localeCompare(
              observationB.effectiveDateTime || ""
            ) || -1
        );
      if (weightsBeforePregnancy.length) {
        const prePregnancyWeightObservation =
          weightsBeforePregnancy[weightsBeforePregnancy.length - 1];
        const prePregnancyWeight = this.getObservationValueQuantities([
          prePregnancyWeightObservation,
        ]);
        if (prePregnancyWeight) {
          return (
            prePregnancyWeight +
            (includeSource
              ? " (from general weight observations on " +
                moment(
                  prePregnancyWeightObservation.effectiveDateTime
                ).format() +
                ")"
              : "")
          );
        }
      }
    }

    return null;
  }

  public getPrimaryPaymentSource(): string | null {
    const coverages = this.dataRequests.find(
      (request) => request.description === "Mother Coverage"
    )?.responseData as fhir4.Coverage[];

    if (!coverages || !coverages.length) {
      return null;
    }

    const deliveryDate = moment(this.getDeliveryDate());
    if (!deliveryDate.isValid()) {
      return null;
    }

    const eligibleCoverages = coverages.filter((coverage) => {
      return (
        // If no coverage period, allow it
        !coverage.period ||
        // If no start date or start date is before delivery date AND
        // If no end date or end date is after delivery date, allow it
        ((!coverage.period.start ||
          moment(coverage.period.start).isSameOrBefore(deliveryDate)) &&
          (!coverage.period.end ||
            moment(coverage.period.end).isSameOrAfter(deliveryDate)))
      );
    });

    return eligibleCoverages
      .map((coverage) => {
        if (!coverage.payor?.length) {
          return "";
        }
        return coverage.payor.map((payor) => payor.display).join(", ");
      })
      .join(", ");
  }

  private getMotherRiskFactorOrCondition(
    snomedCode: string,
    includeSource = false
  ) {
    // Check each observation for a valueCodeableConcept with the appropriate SNOMED code
    const observations = this.getObservationsWithDescription(
      "Mother's Risk Factors Observations"
    );
    if (observations?.length) {
      const relevantObservation = observations
        .flatMap((obs) =>
          obs.valueCodeableConcept?.coding
            ? [...obs.valueCodeableConcept.coding]
            : []
        )
        .find(
          (coding) =>
            coding.code === snomedCode &&
            coding.system === "http://snomed.info/sct"
        );
      if (relevantObservation) {
        return (
          relevantObservation.display +
          (includeSource ? " (from Mother's Risk Factors Observations)" : "")
        );
      }
    }

    // If no risk observation, look for condition with provided SNOMED code
    const conditions = this.getConditionsWithDescription("Mother Conditions");
    if (conditions?.length) {
      const relevantCondition = conditions
        .flatMap((condition) =>
          condition.code?.coding ? [...condition.code.coding] : []
        )
        .find(
          (coding) =>
            coding.code === snomedCode &&
            coding.system === "http://snomed.info/sct"
        );
      if (relevantCondition) {
        return (
          relevantCondition.display +
          (includeSource ? " (from Mother's Conditions)" : "")
        );
      }
    }
    return null;
  }

  public getPrePregnancyDiabetes(includeSource = false): string | null {
    return this.getMotherRiskFactorOrCondition("73211009", includeSource);
  }

  public getPrePregnancyHypertension(includeSource = false): string | null {
    return this.getMotherRiskFactorOrCondition("38341003", includeSource);
  }

  public getGestationalDiabetes(includeSource = false): string | null {
    return this.getMotherRiskFactorOrCondition("11687002", includeSource);
  }

  public getGestationalHypertension(includeSource = false): string | null {
    return this.getMotherRiskFactorOrCondition("48194001", includeSource);
  }

  public getEclampsia(includeSource = false): string | null {
    return this.getMotherRiskFactorOrCondition("15938005", includeSource);
  }

  public getPreviousPretermBirth(includeSource = false): string | null {
    return this.getMotherRiskFactorOrCondition("161765003", includeSource);
  }

  private getLaborDeliveryCharacteristicOrProcedure(
    snomedCode: string,
    includeSource = false
  ) {
    const observations = this.getObservationsWithDescription(
      "Characteristics of Labor/Delivery Observations"
    );
    if (observations?.length) {
      const relevantObservation = observations
        .flatMap((obs) =>
          obs.valueCodeableConcept?.coding
            ? [...obs.valueCodeableConcept.coding]
            : []
        )
        .find(
          (coding) =>
            coding.code === snomedCode &&
            coding.system === "http://snomed.info/sct"
        );
      if (relevantObservation) {
        return (
          relevantObservation.display +
          (includeSource
            ? " (from Characteristics of Labor/Delivery Observations)"
            : "")
        );
      }
    }
    const procedures = this.getProceduresWithDescription("Mother Procedures");
    if (procedures?.length) {
      const relevantProcedure = procedures
        .flatMap((proc) => (proc?.code?.coding ? [...proc?.code?.coding] : []))
        .find(
          (coding) =>
            coding.code === snomedCode &&
            coding.system === "http://snomed.info/sct"
        );
      if (relevantProcedure) {
        return (
          relevantProcedure.display +
          (includeSource ? " (from Procedures)" : "")
        );
      }
    }

    return null;
  }

  public getInductionOfLabor(includeSource = false): string | null {
    return this.getLaborDeliveryCharacteristicOrProcedure(
      "236958009",
      includeSource
    );
  }

  public getAugmentationOfLabor(includeSource = false): string | null {
    return this.getLaborDeliveryCharacteristicOrProcedure(
      "237001001",
      includeSource
    );
  }

  public getMotherAntibioticsDuringLabor(includeSource = false): string | null {
    return this.getLaborDeliveryCharacteristicOrProcedure(
      "634771000124114",
      includeSource
    );
  }

  public getEpidural(includeSource = false): string | null {
    return this.getLaborDeliveryCharacteristicOrProcedure(
      "231064003",
      includeSource
    );
  }

  public getFetalPresentation(includeSource = false): string | null {
    const observations = this.getObservationsWithDescription(
      "Fetal Presentation"
    );
    if (observations?.length) {
      const results = observations
        .flatMap((obs) =>
          obs.valueCodeableConcept?.coding
            ? [...obs.valueCodeableConcept?.coding]
            : []
        )
        .map((coding) => coding.display)
        .join(", ");
      return (
        results +
        (includeSource ? " (from Fetal Presentation observations)" : "")
      );
    }

    // If no presentation observation, look for condition with a SNOMED code for presentation
    const conditions = this.getConditionsWithDescription("Mother Conditions");
    if (conditions?.length) {
      const presentationSnomedCodes = [
        "6096002", //Breech
        "70028003", //Cephalic/Vertex
        "394841004", //Other
        "261665006", //Unknown
        "163518000", //Unknown fetal presentation (not found except in FHIR mapping spreadsheet?)
      ];
      const fetalPresentationFromConditions = conditions
        .flatMap((condition) =>
          condition.code?.coding ? [...condition.code.coding] : []
        )
        .filter(
          (coding) =>
            presentationSnomedCodes.includes(coding.code || "") &&
            coding.system === "http://snomed.info/sct"
        )
        .map((coding) => coding.display)
        .join(", ");
      if (fetalPresentationFromConditions) {
        return (
          fetalPresentationFromConditions +
          (includeSource ? " (from Mother's Conditions)" : "")
        );
      }
    }

    return null;
  }

  public getFinalRouteMethodDelivery(): string | null {
    const procedures = this.getProceduresWithDescription("Mother Procedures");
    if (procedures?.length) {
      const routeSnomedCodes = [
        "48782003", // Normal (spontaneous vaginal?)
        "302383004", // Forceps
        "61586001", // Vacuum
        "11466000", // Cesarean
        "261665006", // Unknown
      ];
      const routeFromProcedures = procedures
        .flatMap((procedure) =>
          procedure.code?.coding ? [...procedure.code.coding] : []
        )
        .filter(
          (coding) =>
            routeSnomedCodes.includes(coding.code || "") &&
            coding.system === "http://snomed.info/sct"
        )
        .map((coding) => coding.display + ` [${coding.code}]`)
        .join(", ");
      if (routeFromProcedures) {
        return routeFromProcedures;
      }
    }

    return null;
  }

  public getTrialOfLaborAttempted(): string | null {
    const cesareanSnomed = "11466000";
    const finalRouteMethodOfDelivery = this.getFinalRouteMethodDelivery();
    if (
      finalRouteMethodOfDelivery &&
      !finalRouteMethodOfDelivery.includes(cesareanSnomed)
    ) {
      return "Cesarean not attempted";
    }
    const observations = this.getObservationsWithDescription(
      "Trial of Labor Attempted"
    );
    if (
      !finalRouteMethodOfDelivery ||
      (finalRouteMethodOfDelivery.includes(cesareanSnomed) &&
        observations?.length)
    ) {
      const laborAttemptedFromObservation = observations.some(
        (obs) => obs.valueBoolean === true
      );
      if (laborAttemptedFromObservation) {
        return "Yes";
      }
      const laborNotAttemptedFromObservation = observations.some(
        (obs) => obs.valueBoolean === false
      );
      if (laborNotAttemptedFromObservation) {
        return "No";
      }
    }
    return null;
  }

  public getMaternalMorbidityValue(
    snomedCode: string,
    includeSource = false
  ): string | null {
    // Check specific maternal morbidity observations first
    const morbidityObservations = this.getObservationsWithDescription(
      "Maternal Morbidity Observations"
    );
    if (morbidityObservations?.length) {
      const results = morbidityObservations
        .flatMap((obs) =>
          obs.valueCodeableConcept?.coding
            ? [...obs.valueCodeableConcept?.coding]
            : []
        )
        .filter(
          (coding) =>
            coding.code === snomedCode &&
            coding.system === "http://snomed.info/sct"
        )
        .map((coding) => coding.display)
        .join(", ");
      if (results) {
        return (
          results +
          (includeSource ? " (from Maternal Morbidity observations)" : "")
        );
      }
    }
    // Then check mother's conditions
    const conditions = this.getConditionsWithDescription("Mother Conditions");
    if (conditions?.length) {
      const relevantCondition = conditions
        .flatMap((condition) =>
          condition.code?.coding ? [...condition.code.coding] : []
        )
        .filter(
          (coding) =>
            coding.code === snomedCode &&
            coding.system === "http://snomed.info/sct"
        )
        .map((coding) => coding.display)
        .join(", ");
      if (relevantCondition) {
        return (
          relevantCondition +
          (includeSource ? " (from Mother's Conditions)" : "")
        );
      }
    }

    // THEN check procedures if nothing found. Blech - get your $#!+ together, FHIR. 😕
    const procedures = this.getProceduresWithDescription("Mother Procedures");
    if (procedures?.length) {
      const relevantProcedure = procedures
        .flatMap((procedure) =>
          procedure.code?.coding ? [...procedure.code.coding] : []
        )
        .filter(
          (coding) =>
            coding.code === snomedCode &&
            coding.system === "http://snomed.info/sct"
        )
        .map((coding) => coding.display)
        .join(", ");
      if (relevantProcedure) {
        return (
          relevantProcedure +
          (includeSource ? " (from Mother's Procedures)" : "")
        );
      }
    }
    return null;
  }

  public getMaternalTransfusion(includeSource = false): string | null {
    return this.getMaternalMorbidityValue("116859006", includeSource);
  }

  public getRupturedUterus(includeSource = false): string | null {
    return this.getMaternalMorbidityValue("34430009", includeSource);
  }

  public getMaternalIcuAdmission(includeSource = false): string | null {
    return this.getMaternalMorbidityValue("309904001", includeSource);
  }

  public getPerinealLacerations(includeSource = false): string | null {
    return this.getMaternalMorbidityValue("398019008", includeSource);
  }

  public getUnplannedHysterectomy(includeSource = false): string | null {
    return this.getMaternalMorbidityValue("625654015", includeSource);
  }

  public getAbnormalNewbornConditionValue(
    expectedCode: string,
    system: string | null,
    includeSource = false
  ): string | null {
    // Check specific abnormal newborn observations first
    const anbormalObservations = this.getObservationsWithDescription(
      "Abnormal Newborn Conditions"
    );
    if (anbormalObservations?.length) {
      const results = anbormalObservations
        .flatMap((obs) =>
          obs.valueCodeableConcept?.coding
            ? [...obs.valueCodeableConcept?.coding]
            : []
        )
        .filter(
          (coding) =>
            coding.code === expectedCode &&
            (!system || coding.system === system)
        )
        .map((coding) => coding.display)
        .join(", ");
      if (results) {
        return (
          results +
          (includeSource
            ? " (from Abnormal Newborn Condition observations)"
            : "")
        );
      }
    }

    // Then check child's conditions
    const conditions = this.getConditionsWithDescription("Child Conditions");
    if (conditions?.length) {
      const relevantCondition = conditions
        .flatMap((condition) =>
          condition.code?.coding ? [...condition.code.coding] : []
        )
        .filter(
          (coding) =>
            coding.code === expectedCode &&
            (!system || coding.system === system)
        )
        .map((coding) => coding.display)
        .join(", ");
      if (relevantCondition) {
        return (
          relevantCondition +
          (includeSource ? " (from Child's Conditions)" : "")
        );
      }
    }

    // THEN check procedures if nothing found. Blech - get your $#!+ together, FHIR. 😕
    const procedures = this.getProceduresWithDescription("Child Procedures");
    if (procedures?.length) {
      const relevantProcedure = procedures
        .flatMap((procedure) =>
          procedure.code?.coding ? [...procedure.code.coding] : []
        )
        .filter(
          (coding) =>
            coding.code === expectedCode &&
            (!system || coding.system === system)
        )
        .map((coding) => coding.display)
        .join(", ");
      if (relevantProcedure) {
        return (
          relevantProcedure +
          (includeSource ? " (from Child's Procedures)" : "")
        );
      }
    }
    return null;
  }

  public getNicuAdmission(includeSource = false): string | null {
    return this.getAbnormalNewbornConditionValue(
      "405269005",
      "http://snomed.info/sct",
      includeSource
    );
  }

  public getSurfactantTherapy(includeSource = false): string | null {
    return this.getAbnormalNewbornConditionValue(
      "43470100012410",
      "http://snomed.info/sct",
      includeSource
    );
  }

  public getAssistedVentilationAfterDelivery(
    includeSource = false
  ): string | null {
    // TODO: determine the system of this code. Per the docs, it should be "PHIN VS (CDC Local Coding System)"
    return this.getAbnormalNewbornConditionValue(
      "PHC1250",
      null,
      includeSource
    );
  }

  public getAssistedVentilation6HoursAfterDelivery(
    includeSource = false
  ): string | null {
    // TODO: determine the system of this code. Per the docs, it should be "PHIN VS (CDC Local Coding System)"
    return this.getAbnormalNewbornConditionValue(
      "PHC1251",
      null,
      includeSource
    );
  }

  public getNewbornSeizure(includeSource = false): string | null {
    return this.getAbnormalNewbornConditionValue(
      "91175000",
      "http://snomed.info/sct",
      includeSource
    );
  }

  public getNewbornAntibiotics(includeSource = false): string | null {
    return this.getAbnormalNewbornConditionValue(
      "434621000124103",
      "http://snomed.info/sct",
      includeSource
    );
  }

  public getGestationalAge(): string | null {
    return this.getObservationValueQuantities(
      this.getObservationsWithDescription("Gestational Age")
    );
  }

  public getPlurality(): string | null {
    return this.getObservationValueIntegers(
      this.getObservationsWithDescription("Multiple Birth Indicator")
    );
  }

  public getPreviousCesareans(): string | null {
    return this.getObservationValueIntegers(
      this.getObservationsWithDescription("Previous Cesareans")
    );
  }

  public getCongenitalAnomaliesValue(
    expectedCode: string,
    system: string | null,
    includeSource = false
  ): string | null {
    // Check specific newborn anomaly observations first
    const anomaliesObservations = this.getObservationsWithDescription(
      "Congenital Anomalies"
    );
    if (anomaliesObservations?.length) {
      const results = anomaliesObservations
        .flatMap((obs) =>
          obs.valueCodeableConcept?.coding
            ? [...obs.valueCodeableConcept?.coding]
            : []
        )
        .filter(
          (coding) =>
            coding.code === expectedCode &&
            (!system || coding.system === system)
        )
        .map((coding) => coding.display)
        .join(", ");
      if (results) {
        return (
          results +
          (includeSource ? " (from Congenital Anomalies observations)" : "")
        );
      }
    }

    // Then check child's conditions
    const conditions = this.getConditionsWithDescription("Child Conditions");
    if (conditions?.length) {
      const relevantCondition = conditions
        .flatMap((condition) =>
          condition.code?.coding ? [...condition.code.coding] : []
        )
        .filter(
          (coding) =>
            coding.code === expectedCode &&
            (!system || coding.system === system)
        )
        .map((coding) => coding.display)
        .join(", ");
      if (relevantCondition) {
        return (
          relevantCondition +
          (includeSource ? " (from Child's Conditions)" : "")
        );
      }
    }

    // THEN check procedures if nothing found. Blech - get your $#!+ together, FHIR. 😕
    const procedures = this.getProceduresWithDescription("Child Procedures");
    if (procedures?.length) {
      const relevantProcedure = procedures
        .flatMap((procedure) =>
          procedure.code?.coding ? [...procedure.code.coding] : []
        )
        .filter(
          (coding) =>
            coding.code === expectedCode &&
            (!system || coding.system === system)
        )
        .map((coding) => coding.display)
        .join(", ");
      if (relevantProcedure) {
        return (
          relevantProcedure +
          (includeSource ? " (from Child's Procedures)" : "")
        );
      }
    }
    return null;
  }

  public getCongenitalAnomaliesNone(includeSource = false): string | null {
    return this.getCongenitalAnomaliesValue(
      "260413007",
      "http://snomed.info/sct",
      includeSource
    );
  }

  public getAnencephaly(includeSource = false): string | null {
    return this.getCongenitalAnomaliesValue(
      "89369001",
      "http://snomed.info/sct",
      includeSource
    );
  }

  public getMeningomyeloceleSpinaBifida(includeSource = false): string | null {
    return this.getCongenitalAnomaliesValue(
      "67531005",
      "http://snomed.info/sct",
      includeSource
    );
  }

  public getCchd(includeSource = false): string | null {
    return this.getCongenitalAnomaliesValue(
      "12770006",
      "http://snomed.info/sct",
      includeSource
    );
  }

  public getDiaphragmaticHernia(includeSource = false): string | null {
    return this.getCongenitalAnomaliesValue(
      "17190001",
      "http://snomed.info/sct",
      includeSource
    );
  }

  public getOmphalocele(includeSource = false): string | null {
    return this.getCongenitalAnomaliesValue(
      "18735004",
      "http://snomed.info/sct",
      includeSource
    );
  }

  public getGastroschisis(includeSource = false): string | null {
    return this.getCongenitalAnomaliesValue(
      "72951007",
      "http://snomed.info/sct",
      includeSource
    );
  }

  public getLimbReduction(includeSource = false): string | null {
    return this.getCongenitalAnomaliesValue(
      "67341007",
      "http://snomed.info/sct",
      includeSource
    );
  }

  public getCleftPalateAlone(includeSource = false): string | null {
    return this.getCongenitalAnomaliesValue(
      "87979003",
      "http://snomed.info/sct",
      includeSource
    );
  }

  public getCleftLip(includeSource = false): string | null {
    return this.getCongenitalAnomaliesValue(
      "80281008",
      "http://snomed.info/sct",
      includeSource
    );
  }

  public getHypospadias(includeSource = false): string | null {
    return this.getCongenitalAnomaliesValue(
      "416010008",
      "http://snomed.info/sct",
      includeSource
    );
  }

  public getDownSyndrome(includeSource = false): string | null {
    return this.getCongenitalAnomaliesValue(
      "70156005",
      "http://snomed.info/sct",
      includeSource
    );
  }

  public getDownSyndromeKaryotypeConfirmed(): string | null {
    const hasDownSyndrome = Boolean(this.getDownSyndrome());
    if (!hasDownSyndrome) {
      return null;
    }
    const karyotypeObservations = this.getObservationsWithDescription(
      "Down Syndrome Karyotype"
    );
    if (karyotypeObservations?.length) {
      const hasKaryotypeConfirmed = Boolean(
        karyotypeObservations
          .flatMap((obs) =>
            obs.valueCodeableConcept?.coding
              ? [...obs.valueCodeableConcept.coding]
              : []
          )
          .filter(
            (coding) =>
              coding.code === "442124003" &&
              coding.system === "http://snomed.info/sct"
          ).length
      );
      if (hasKaryotypeConfirmed) {
        return "Confirmed";
      }
      return "Not confirmed";
    }
    return null;
  }

  public getChromosomalAnomaly(includeSource = false): string | null {
    return this.getCongenitalAnomaliesValue(
      "70156005",
      "http://snomed.info/sct",
      includeSource
    );
  }

  public getChromosomalAnomalyKaryotypeConfirmed(): string | null {
    const hasChromosomalAnomaly = Boolean(this.getChromosomalAnomaly());
    if (!hasChromosomalAnomaly) {
      return null;
    }
    const karyotypeObservations = this.getObservationsWithDescription(
      "Chromosomal Anomaly Karyotype"
    );
    if (karyotypeObservations?.length) {
      const hasKaryotypeConfirmed = Boolean(
        karyotypeObservations
          .flatMap((obs) =>
            obs.valueCodeableConcept?.coding
              ? [...obs.valueCodeableConcept.coding]
              : []
          )
          .filter(
            (coding) =>
              coding.code === "312948004" &&
              coding.system === "http://snomed.info/sct"
          ).length
      );
      if (hasKaryotypeConfirmed) {
        return "Confirmed";
      }
      return "Not confirmed";
    }
    return null;
  }

  public getPregnancyInfectionValue(
    expectedCode: string,
    system: string | null,
    includeSource = false
  ): string | null {
    // Check specific infections during pregnancy  observations first
    const infectionsObservations = this.getObservationsWithDescription(
      "Infections During Pregnancy"
    );
    if (infectionsObservations?.length) {
      const results = infectionsObservations
        .flatMap((obs) =>
          obs.valueCodeableConcept?.coding
            ? [...obs.valueCodeableConcept?.coding]
            : []
        )
        .filter(
          (coding) =>
            coding.code === expectedCode &&
            (!system || coding.system === system)
        )
        .map((coding) => coding.display)
        .join(", ");
      if (results) {
        return (
          results +
          (includeSource
            ? " (from Infections During Pregnancy observations)"
            : "")
        );
      }
    }

    // Then check mother's conditions
    const conditions = this.getConditionsWithDescription("Mother Conditions");
    if (conditions?.length) {
      const relevantCondition = conditions
        .flatMap((condition) =>
          condition.code?.coding ? [...condition.code.coding] : []
        )
        .filter(
          (coding) =>
            coding.code === expectedCode &&
            (!system || coding.system === system)
        )
        .map((coding) => coding.display)
        .join(", ");
      if (relevantCondition) {
        return (
          relevantCondition +
          (includeSource ? " (from Mother's Conditions)" : "")
        );
      }
    }

    return null;
  }

  public getChlamydia(includeSource = false): string | null {
    return this.getPregnancyInfectionValue(
      "105629000",
      "http://snomed.info/sct",
      includeSource
    );
  }

  public getCytomeglovirus(includeSource = false): string | null {
    // Note: this code really only appears in the fetal death report
    return this.getPregnancyInfectionValue(
      "28944009",
      "http://snomed.info/sct",
      includeSource
    );
  }

  public getGroupBStrep(includeSource = false): string | null {
    // Note: this code really only appears in the fetal death report
    return this.getPregnancyInfectionValue(
      "426933007",
      "http://snomed.info/sct",
      includeSource
    );
  }

  public getGonorrhea(includeSource = false): string | null {
    return this.getPregnancyInfectionValue(
      "1562800",
      "http://snomed.info/sct",
      includeSource
    );
  }

  public getHerpes(includeSource = false): string | null {
    // Note: this code doesn't appear in either birth nor fetal death report...?
    return this.getPregnancyInfectionValue(
      "33839006",
      "http://snomed.info/sct",
      includeSource
    );
  }

  public getHepatitisA(includeSource = false): string | null {
    return this.getPregnancyInfectionValue(
      "40468003",
      "http://snomed.info/sct",
      includeSource
    );
  }

  public getHepatitisB(includeSource = false): string | null {
    return this.getPregnancyInfectionValue(
      "66071002",
      "http://snomed.info/sct",
      includeSource
    );
  }

  public getHepatitisC(includeSource = false): string | null {
    return this.getPregnancyInfectionValue(
      "50711007",
      "http://snomed.info/sct",
      includeSource
    );
  }

  public getHivAids(includeSource = false): string | null {
    return (
      // HIV positive test (finding) - probably won't ever find this one?
      this.getPregnancyInfectionValue(
        "165816005",
        "http://snomed.info/sct",
        includeSource
      ) ||
      // HIV infection (disorder)
      this.getPregnancyInfectionValue(
        "86406008",
        "http://snomed.info/sct",
        includeSource
      ) ||
      // AIDS (disorder)
      this.getPregnancyInfectionValue(
        "62479008",
        "http://snomed.info/sct",
        includeSource
      )
    );
  }

  public getSyphilis(includeSource = false): string | null {
    return this.getPregnancyInfectionValue(
      "76272004",
      "http://snomed.info/sct",
      includeSource
    );
  }

  public getZika(includeSource = false): string | null {
    // Didn't receive Zika SNOMED codes. Found a couple that looked right?
    return (
      this.getPregnancyInfectionValue(
        "762725007",
        "http://snomed.info/sct",
        includeSource
      ) ||
      this.getPregnancyInfectionValue(
        "3928002",
        "http://snomed.info/sct",
        includeSource
      )
    );
  }
}

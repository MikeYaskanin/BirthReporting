import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Checkbox,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Fab,
  LinearProgress,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@material-ui/core";
import {
  CheckCircle,
  ErrorOutlined,
  ExpandMore,
  FileCopy,
  FileCopyOutlined,
  RemoveCircle,
} from "@material-ui/icons";
import React, { useState } from "react";
import { BirthRecord } from "../model/BirthRecord";
import { DataRequest } from "../model/DataRequest";
import {
  CsvGeneratorService,
  CSV_HEADERS,
} from "../services/CsvGeneratorService";
import { EhrService } from "../services/EhrService";

// const sampleMrns = "90827350, 89753462, 66823042, 35774386";

const RecordTable: React.FC = () => {
  // Other newborn with much sparser data: 6281
  const [mrnListText, setMrnListText] = useState("6946");
  const [dataCollectionComplete, setDataCollectionComplete] = useState(false);
  const [selectedMrnFileName, setSelectedMrnFileName] = useState("");
  const [birthRecords, setBirthRecords] = useState<BirthRecord[]>([]);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [recordToInspect, setRecordToInspect] = useState<BirthRecord>();
  const fileInputRef = React.createRef<HTMLInputElement>();

  function loadMrnsFromString(mrnString: string) {
    if (!mrnString) {
      alert("No MRNs found");
      return;
    }

    const mrnList = mrnString.split(",");
    const birthRecordList: BirthRecord[] = mrnList.map((rawMrn) => {
      const record = new BirthRecord();
      record.childMrn = rawMrn.trim();
      return record;
    });
    setBirthRecords(birthRecordList);
    setActiveStep(1);
  }

  function setRecordStatus(
    recordToUpdate: BirthRecord,
    status: BirthRecord["status"]
  ) {
    const records = [...birthRecords];
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      if (record === recordToUpdate) {
        record.status = status;
        break;
      }
    }
    setBirthRecords(records);
  }

  function updateRecordWithData(
    recordToUpdate: BirthRecord,
    dataRequests: DataRequest<fhir4.Resource | fhir4.Resource[]>[]
  ) {
    const records = [...birthRecords];
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      if (record === recordToUpdate) {
        record.dataRequests = [...record.dataRequests, ...dataRequests];
        break;
      }
    }
    setBirthRecords(records);
  }

  async function beginDataCollection() {
    const checkedRecords = birthRecords.filter(
      (birthRecord) => birthRecord.selected
    );
    while (checkedRecords.length > 0) {
      const recordToProcess = checkedRecords.shift();
      if (recordToProcess) {
        console.log("processing mrn " + recordToProcess.childMrn);
        setRecordStatus(recordToProcess, "In progress");
        try {
          const dataForRecord = await collectDataForRecord(recordToProcess);
          updateRecordWithData(recordToProcess, dataForRecord);
          setRecordStatus(recordToProcess, "Complete");
        } catch (e) {
          setRecordStatus(recordToProcess, "Error");
        }
      }
    }
    setDataCollectionComplete(true);
  }

  function getBirthParentDetails(
    birthRecord: BirthRecord
  ): Promise<DataRequest<fhir4.Resource | fhir4.Resource[]>[]> {
    return EhrService.getRelatedPeopleForPatient(
      birthRecord.getChildPatient()
    ).then((relatedPersons) => {
      birthRecord.dataRequests.push(relatedPersons);
      return EhrService.getMotherPatientFromChildRelatedPersons(
        relatedPersons.responseData
      ).then((motherPatient) => {
        birthRecord.dataRequests.push(motherPatient);

        const motherRequests: Promise<
          DataRequest<fhir4.Resource | fhir4.Resource[]>
        >[] = [
          EhrService.getMotherWeightObservations(birthRecord),
          EhrService.getMotherPrePregnancyWeightObservations(birthRecord),
          EhrService.getMotherDeliveryWeightObservations(birthRecord),
          EhrService.getMotherHeightObservations(birthRecord),
          EhrService.getPrincipalPaymentObservations(birthRecord),
          EhrService.getMotherConditions(birthRecord),
          EhrService.getMotherPregnancyRiskFactorObservations(birthRecord),
          EhrService.getCharacteristicsLaborDeliveryObservations(birthRecord),
          EhrService.getMotherProcedures(birthRecord),
          EhrService.getTrialOfLaborAttemptedObservations(birthRecord),
          EhrService.getMaternalMorbidityObservations(birthRecord),
          EhrService.getPluralityObservations(birthRecord),
          EhrService.getPreviousCesareansObservations(birthRecord),
          EhrService.getPregnancyInfectionsObservations(birthRecord),
        ];

        // For any mother requests, fetch them here
        return Promise.all(motherRequests);
      });
    });
  }

  async function collectDataForRecord(
    record: BirthRecord
  ): Promise<DataRequest<fhir4.Resource | fhir4.Resource[]>[]> {
    return EhrService.getChildPatientDetails(record).then((childPatient) => {
      record.dataRequests = [childPatient];
      return getBirthParentDetails(record).then((birthParentDetails) => {
        return Promise.all([
          ...birthParentDetails,
          EhrService.get10MinuteApgarScoreObservations(record),
          EhrService.get5MinuteApgarScoreObservations(record),
          EhrService.get1MinuteApgarScoreObservations(record),
          EhrService.getInfantLivingObservations(record),
          EhrService.getChildWeightObservations(record),
          EhrService.getChildBirthWeightObservations(record),
          EhrService.getDeliveryDateObservations(record),
          EhrService.getFetalPresentationObservations(record),
          EhrService.getAbnormalNewbornObservations(record),
          EhrService.getChildConditions(record),
          EhrService.getGestationalAgeObservations(record),
          EhrService.getCongenitalAnomaliesObservations(record),
          EhrService.getChildDownSyndromeKaryotypeObservations(record),
          EhrService.getChildChromosomalAnomalyKaryotypeObservations(record),
        ]);
      });
    });
  }

  return (
    <Container style={{ paddingTop: 24 }}>
      <Stepper activeStep={activeStep} orientation="vertical">
        <Step>
          <StepLabel>Load Child MRNs</StepLabel>
          <StepContent>
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Button
                  variant="outlined"
                  style={{ display: "flex", alignItems: "center" }}
                  onClick={() =>
                    fileInputRef.current && fileInputRef.current.click()
                  }
                >
                  <FileCopy />
                  <span>
                    Select a {selectedMrnFileName ? " New " : ""} File
                  </span>
                </Button>

                <input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  onChange={() => {
                    const file = fileInputRef.current?.files
                      ? fileInputRef.current?.files[0]
                      : null;
                    if (!file) {
                      setSelectedMrnFileName("");
                      return;
                    }
                    setSelectedMrnFileName(file?.name);
                    const reader = new FileReader();
                    reader.addEventListener("load", (loadEvent) => {
                      if (loadEvent.target?.result) {
                        const mrnString = loadEvent.target.result as string;
                        loadMrnsFromString(mrnString);
                      }
                    });
                    reader.readAsText(file);
                  }}
                />
                <pre>{selectedMrnFileName}</pre>
              </div>
              <Typography>or</Typography>
              <div style={{ display: "flex", alignItems: "center" }}>
                <TextField
                  label="Comma-separated MRNs"
                  multiline
                  rows={3}
                  style={{ minWidth: 300 }}
                  value={mrnListText}
                  onChange={(e) => {
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                    setMrnListText(e.target.value);
                  }}
                  variant="outlined"
                />{" "}
                <Button
                  onClick={() => loadMrnsFromString(mrnListText)}
                  disabled={!mrnListText}
                  variant="outlined"
                  style={{ marginLeft: 12 }}
                >
                  Use these values
                </Button>
              </div>
            </div>
          </StepContent>
        </Step>
        <Step>
          <StepLabel>Fetch Data from EHR</StepLabel>
          <StepContent>
            <Paper elevation={4}>
              <h2 style={{ marginLeft: 24, paddingTop: 24, fontWeight: 100 }}>
                Records to Process
              </h2>
              {birthRecords && (
                <List>
                  {birthRecords.map((birthRecord, index) => (
                    <ListItem
                      button
                      onClick={() => setRecordToInspect(birthRecord)}
                      key={index}
                    >
                      <Checkbox
                        checked={birthRecord.selected}
                        onClick={(e) => {
                          e.stopPropagation();
                          const records = [...birthRecords];
                          for (let i = 0; i < records.length; i++) {
                            const record = records[i];
                            if (record === birthRecord) {
                              record.selected = !record.selected;
                              break;
                            }
                          }
                          setBirthRecords(records);
                        }}
                        style={{ marginRight: 12 }}
                      />
                      <ListItemText>
                        <strong>MRN:</strong> {birthRecord.childMrn}
                      </ListItemText>
                      {birthRecord.status === "In progress" && (
                        <LinearProgress
                          variant="indeterminate"
                          style={{ width: 100 }}
                        />
                      )}
                      {birthRecord.status === "Error" && (
                        <ErrorOutlined style={{ color: "red" }} />
                      )}
                      {birthRecord.status === "Complete" && (
                        <CheckCircle style={{ color: "green" }} />
                      )}
                      <ListItemSecondaryAction></ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  paddingBottom: 12,
                }}
              >
                {dataCollectionComplete && (
                  <Button
                    onClick={() => {
                      CsvGeneratorService.generateBirthRecordsCSV(birthRecords);
                    }}
                  >
                    Download CSV
                  </Button>
                )}
                <Button onClick={beginDataCollection}>
                  Begin Data Collection
                </Button>
              </div>
            </Paper>

            <TableContainer
              component={Paper}
              style={{ marginTop: 16, overflowX: "scroll" }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    {CSV_HEADERS.map((header) => (
                      <TableCell
                        key={header.label}
                        style={{ whiteSpace: "nowrap" }}
                      >
                        {header.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {birthRecords
                    .filter((record) =>
                      ["Error", "Complete"].includes(record.status)
                    )
                    .map(CsvGeneratorService.getBirthRecordCsvValues)
                    .map((birthRecordValues, i) => (
                      <TableRow key={i}>
                        {birthRecordValues.map((value, i) => (
                          <TableCell key={i}>{value}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </StepContent>
        </Step>
      </Stepper>

      <Dialog
        open={Boolean(recordToInspect)}
        onClose={() => setRecordToInspect(undefined)}
        fullWidth
        maxWidth="lg"
      >
        {recordToInspect && (
          <>
            <DialogTitle>
              Details for MRN: {recordToInspect.childMrn}
            </DialogTitle>
            <DialogContent>
              {recordToInspect.dataRequests.map((dataRequest, index) => (
                <Accordion
                  key={index}
                  TransitionProps={{ unmountOnExit: true }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      {dataRequest.description}
                      {dataRequest.responseData && (
                        <CheckCircle color="primary" />
                      )}
                      {dataRequest.error && <RemoveCircle />}
                    </div>
                  </AccordionSummary>
                  <AccordionDetails
                    style={{ display: "flex", flexDirection: "column" }}
                  >
                    <Divider />
                    <span>
                      <strong>Request URL: </strong>
                      {dataRequest.requestUrl}
                    </span>
                    {dataRequest.responseData && (
                      <div style={{ position: "relative" }}>
                        <Fab
                          onClick={() => {
                            navigator.clipboard.writeText(
                              JSON.stringify(dataRequest.responseData, null, 2)
                            );
                          }}
                          color="primary"
                          style={{ position: "absolute", top: 24, right: 24 }}
                        >
                          <FileCopyOutlined />
                        </Fab>
                        <pre
                          style={{
                            backgroundColor: "#EFEFEF",
                            padding: 8,
                            whiteSpace: "pre-wrap",
                            maxHeight: 500,
                            overflowY: "auto",
                          }}
                        >
                          {JSON.stringify(dataRequest.responseData, null, 2)}
                        </pre>
                      </div>
                    )}
                    {dataRequest.error && (
                      <p>{dataRequest.error.message || dataRequest.error}</p>
                    )}
                  </AccordionDetails>
                </Accordion>
              ))}
            </DialogContent>
            <DialogActions>
              <Button>Download Responses</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};
export default RecordTable;

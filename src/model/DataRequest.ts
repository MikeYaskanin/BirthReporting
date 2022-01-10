export type DataRequestDescription =
  | "Apgar Score 1 Minute"
  | "Apgar Score 5 Minutes"
  | "Apgar Score 10 Minutes"
  | "Child Patient Resource"
  | "Birth Parent Patient Resource"
  | "Infant Living?"
  | "Related Persons"
  | "Mother Weight"
  | "Mother Pre-Pregnancy Weight"
  | "Mother Delivery Weight"
  | "Child Weight"
  | "Child Birth Weight"
  | "Delivery Date"
  | "Mother Height"
  | "Mother Coverage"
  | "Mother Conditions"
  | "Child Conditions"
  | "Mother's Risk Factors Observations"
  | "Characteristics of Labor/Delivery Observations"
  | "Mother Procedures"
  | "Child Procedures"
  | "Fetal Presentation"
  | "Delivery Route"
  | "Trial of Labor Attempted"
  | "Maternal Morbidity Observations"
  | "Abnormal Newborn Conditions"
  | "Gestational Age"
  | "Multiple Birth Indicator"
  | "Previous Cesareans"
  | "Congenital Anomalies"
  | "Down Syndrome Karyotype"
  | "Chromosomal Anomaly Karyotype"
  | "Infections During Pregnancy";
export interface DataRequest<T> {
  requestUrl: string;
  description: DataRequestDescription;
  responseData?: T;
  error?: any;
}

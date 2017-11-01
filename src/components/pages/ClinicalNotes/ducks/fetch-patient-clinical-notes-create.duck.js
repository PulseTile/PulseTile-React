import { Observable } from 'rxjs';
import { ajax } from 'rxjs/observable/dom/ajax';
import { createAction } from 'redux-actions';

import { usersUrls } from '../../../../config/server-urls.constants'

export const FETCH_PATIENT_CLINICAL_NOTES_CREATE_REQUEST = 'FETCH_PATIENT_CLINICAL_NOTES_CREATE_REQUEST';
export const FETCH_PATIENT_CLINICAL_NOTES_CREATE_SUCCESS = 'FETCH_PATIENT_CLINICAL_NOTES_CREATE_SUCCESS';
export const FFETCH_PATIENT_CLINICAL_NOTES_CREATE_FAILURE = 'FFETCH_PATIENT_CLINICAL_NOTES_CREATE_FAILURE';

export const fetchPatientClinicalNotesCreateRequest = createAction(FETCH_PATIENT_CLINICAL_NOTES_CREATE_REQUEST);
export const fetchPatientClinicalNotesCreateSuccess = createAction(FETCH_PATIENT_CLINICAL_NOTES_CREATE_SUCCESS);
export const fetchPatientClinicalNotesCreateFailure = createAction(FFETCH_PATIENT_CLINICAL_NOTES_CREATE_FAILURE);

export const fetchPatientClinicalNotesCreateEpic = (action$, store) =>
  action$.ofType(FETCH_PATIENT_CLINICAL_NOTES_CREATE_REQUEST)
    .mergeMap(({ payload }) =>
      ajax.post(`${usersUrls.PATIENTS_URL}/${payload.userId}/clinicalnotes`, payload, {
        Cookie: store.getState().credentials.cookie,
        'Content-Type': 'application/json',
      })
        .map(({ response }) => fetchPatientClinicalNotesCreateSuccess(response))
        .catch(error => Observable.of(fetchPatientClinicalNotesCreateFailure(error)))
    );

export default function reducer(patientClinicalNotesCreate = {}, action) {
  switch (action.type) {
    case FETCH_PATIENT_CLINICAL_NOTES_CREATE_SUCCESS:
      return action.payload;
    default:
      return patientClinicalNotesCreate
  }
}
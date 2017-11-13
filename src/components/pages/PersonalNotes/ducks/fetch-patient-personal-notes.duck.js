import _ from 'lodash/fp';
import { Observable } from 'rxjs';
import { ajax } from 'rxjs/observable/dom/ajax';
import { createAction } from 'redux-actions';

import { usersUrls } from '../../../../config/server-urls.constants'

export const FETCH_PATIENT_PERSONAL_NOTES_REQUEST = 'FETCH_PATIENT_PERSONAL_NOTES_REQUEST';
export const FETCH_PATIENT_PERSONAL_NOTES_SUCCESS = 'FETCH_PATIENT_PERSONAL_NOTES_SUCCESS';
export const FETCH_PATIENT_PERSONAL_NOTES_FAILURE = 'FETCH_PATIENT_PERSONAL_NOTES_FAILURE';

export const fetchPatientPersonalNotesRequest = createAction(FETCH_PATIENT_PERSONAL_NOTES_REQUEST);
export const fetchPatientPersonalNotesSuccess = createAction(FETCH_PATIENT_PERSONAL_NOTES_SUCCESS);
export const fetchPatientPersonalNotesFailure = createAction(FETCH_PATIENT_PERSONAL_NOTES_FAILURE);

export const fetchPatientPersonalNotesEpic = (action$, store) =>
  action$.ofType(FETCH_PATIENT_PERSONAL_NOTES_REQUEST)
    .mergeMap(({ payload }) =>
      ajax.getJSON(`${usersUrls.PATIENTS_URL}/${payload.userId}/personalnotes`, {
        headers: { Cookie: store.getState().credentials.cookie },
      })
        .map(response => fetchPatientPersonalNotesSuccess({
          userId: payload.userId,
          personalNotes: response,
        }))
        .catch(error => Observable.of(fetchPatientPersonalNotesFailure(error)))
    );

export default function reducer(patientsPersonalNotes = {}, action) {
  switch (action.type) {
    case FETCH_PATIENT_PERSONAL_NOTES_SUCCESS:
      return _.set(action.payload.userId, action.payload.personalNotes, patientsPersonalNotes);
    default:
      return patientsPersonalNotes;
  }
}
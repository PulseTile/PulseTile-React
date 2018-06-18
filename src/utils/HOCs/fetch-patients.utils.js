import _ from 'lodash/fp';

const generateFetchListOnMount = (fetchRequest) => {
  return {
    componentDidMount() {
      const { actions, match } = this.props;
      const userId = _.get('params.userId', match);
      if (userId) actions[fetchRequest]({ userId });
    },
    componentWillReceiveProps(nextProps) {
      const { actions, match } = this.props;
      const nextUserId = _.get('match.params.userId', nextProps);
      const userId = _.get('params.userId', match);
      if (nextUserId !== userId) {
        actions[fetchRequest]({ userId: nextUserId });
      }
    },
  }
};

const generateFetchDetailOnMount = (fetchRequest) => {
  return {
    componentDidMount() {
      const { actions, match } = this.props;
      const userId = _.get('params.userId', match);
      const sourceId = _.get('params.sourceId', match);
      if (userId && sourceId) actions[fetchRequest]({ userId, sourceId });
    },
  }
};

export const fetchPatientsOnMount = ({
  componentDidMount() {
    this.props.actions.fetchPatientsRequest();
  },
});

export const fetchPatientsCountsOnMountAndUpdate = ({
  componentDidMount() {
    const { allPatients, actions } = this.props;
    actions.fetchPatientCountsRequest(allPatients);
  },

  componentWillReceiveProps({ allPatients, actions }) {
    const isNewPatients = _.negate(_.isEqual(this.props.allPatients));
    return _.cond([
      [isNewPatients, actions.fetchPatientCountsRequest],
    ])(allPatients)
  },
});

export const fetchHeaderToolbarOnMount = ({
  componentDidMount() {
    const { actions, match } = this.props;
    const userId = _.get('params.userId', match);
    if (userId && _.isEmpty(this.props.patientsDemographics[userId])) actions.fetchPatientDemographicsRequest({ userId })
  },
  componentWillReceiveProps(nextProps) {
    const { actions, match } = this.props;
    const nextUserId = _.get('match.params.userId', nextProps);
    const userId = _.get('params.userId', match);
    if (nextUserId !== userId) {
      actions.fetchPatientDemographicsRequest({ userId: nextUserId })
    }
  },
});

export const fetchListOrdersOnMount = ({
  componentDidMount() {
    this.props.actions.fetchListOrdersRequest();
  },
});

export const fetchPatientDemographicsOnMount = (generateFetchListOnMount('fetchPatientDemographicsRequest'));

export const fetchPatientAllergiesOnMount = (generateFetchListOnMount('fetchPatientAllergiesRequest'));
export const fetchPatientAllergiesSynopsisOnMount = (generateFetchListOnMount('fetchPatientAllergiesSynopsisRequest'));
export const fetchPatientAllergiesDetailOnMount = (generateFetchDetailOnMount('fetchPatientAllergiesDetailRequest'));

export const fetchPatientProblemsOnMount = (generateFetchListOnMount('fetchPatientProblemsRequest'));
export const fetchPatientProblemsSynopsisOnMount = (generateFetchListOnMount('fetchPatientDiagnosesSynopsisRequest'));
export const fetchPatientDiagnosesOnMount = (generateFetchListOnMount('fetchPatientDiagnosesRequest'));
export const fetchPatientDiagnosesDetailOnMount = (generateFetchDetailOnMount('fetchPatientDiagnosesDetailRequest'));

export const fetchPatientPersonalNotesOnMount = (generateFetchListOnMount('fetchPatientPersonalNotesRequest'));
export const fetchPatientPersonalNotesDetailOnMount = (generateFetchDetailOnMount('fetchPatientPersonalNotesDetailRequest'));

export const fetchPatientContactsOnMount = (generateFetchListOnMount('fetchPatientContactsRequest'));
export const fetchPatientContactsSynopsisOnMount = (generateFetchListOnMount('fetchPatientContactsSynopsisRequest'));
export const fetchPatientContactsDetailOnMount = (generateFetchDetailOnMount('fetchPatientContactsDetailRequest'));

export const fetchPatientMedicationsOnMount = (generateFetchListOnMount('fetchPatientMedicationsRequest'));
export const fetchPatientMedicationsSynopsisOnMount = (generateFetchListOnMount('fetchPatientMedicationsSynopsisRequest'));
export const fetchPatientMedicationsDetailOnMount = (generateFetchDetailOnMount('fetchPatientMedicationsDetailRequest'));

export const fetchPatientProceduresOnMount = (generateFetchListOnMount('fetchPatientProceduresRequest'));
export const fetchPatientProceduresDetailOnMount = (generateFetchDetailOnMount('fetchPatientProceduresDetailRequest'));

export const fetchPatientReferralsOnMount = (generateFetchListOnMount('fetchPatientReferralsRequest'));
export const fetchPatientReferralsDetailOnMount = (generateFetchDetailOnMount('fetchPatientReferralsDetailRequest'));

export const fetchPatientOrdersOnMount = (generateFetchListOnMount('fetchPatientOrdersRequest'));
export const fetchPatientOrdersDetailOnMount = (generateFetchDetailOnMount('fetchPatientOrdersDetailRequest'));

export const fetchPatientMDTsOnMount = (generateFetchListOnMount('fetchPatientMDTsRequest'));
export const fetchPatientMDTsDetailOnMount = (generateFetchDetailOnMount('fetchPatientMDTsDetailRequest'));

export const fetchPatientVitalsOnMount = (generateFetchListOnMount('fetchPatientVitalsRequest'));
export const fetchPatientVitalsDetailOnMount = (generateFetchDetailOnMount('fetchPatientVitalsDetailRequest'));

export const fetchPatientImagesOnMount = (generateFetchListOnMount('fetchPatientImagesRequest'));

export const fetchSeriesOnMount = ({
  componentDidMount() {
    const { actions, match } = this.props;
    const userId = _.get('params.userId', match);
    const sourceId = _.get('params.sourceId', match);
    const source = 'orthanc';
    if (userId && sourceId) actions.fetchSeriesRequest({ userId, studyId: sourceId, source });
  },
});


// FOR BRONZE PLUGINS
// GenericPlugin
// export const fetchPatientGenericPluginOnMount = (generateFetchListOnMount('fetchPatientGenericPluginRequest'));
// export const fetchPatientGenericPluginDetailOnMount = (generateFetchDetailOnMount('fetchPatientGenericPluginDetailRequest'));
// DiaryEntry
// export const fetchPatientDiaryEntryOnMount = (generateFetchListOnMount('fetchPatientDiaryEntryRequest'));
// export const fetchPatientDiaryEntryDetailOnMount = (generateFetchDetailOnMount('fetchPatientDiaryEntryDetailRequest'));

// FOR SILVER PLUGINS
// Clinical Notes
// export const fetchPatientClinicalNotesOnMount = (generateFetchListOnMount('fetchPatientClinicalNotesRequest'));
// export const fetchPatientClinicalNotesDetailOnMount = (generateFetchDetailOnMount('fetchPatientClinicalNotesDetailRequest'));
// Clinical Statements
// export const fetchPatientClinicalStatementsOnMount = (generateFetchListOnMount('fetchPatientClinicalStatementsRequest'));
// export const fetchPatientClinicalStatementsDetailOnMount = (generateFetchDetailOnMount('fetchPatientClinicalStatementsDetailRequest'));
// export const fetchPatientClinicalStatementsTagsOnMount = ({
//   componentDidMount() {
//     const { actions, match } = this.props;
//     const userId = _.get('params.userId', match);
//     if (userId) actions.fetchPatientClinicalStatementsTagsRequest({ userId });
//   },
// });
// Documents
// export const fetchPatientDocumentsOnMount = (generateFetchListOnMount('fetchPatientDocumentsRequest'));
// export const fetchPatientDocumentsDetailOnMount = (generateFetchDetailOnMount('fetchPatientDocumentsDetailRequest'));
// Drawings
// export const fetchPatientDrawingsOnMount = (generateFetchListOnMount('fetchPatientDrawingsRequest'));
// export const fetchPatientDrawingsDetailOnMount = (generateFetchDetailOnMount('fetchPatientDrawingsDetailRequest'));
// Events
// export const fetchPatientEventsOnMount = (generateFetchListOnMount('fetchPatientEventsRequest'));
// export const fetchPatientEventsDetailOnMount = (generateFetchDetailOnMount('fetchPatientEventsDetailRequest'));
// Vaccinations
// export const fetchPatientVaccinationsOnMount = (generateFetchListOnMount('fetchPatientVaccinationsRequest'));
// export const fetchPatientVaccinationsSynopsisOnMount = (generateFetchListOnMount('fetchPatientVaccinationsSynopsisRequest'));
// export const fetchPatientVaccinationsDetailOnMount = (generateFetchDetailOnMount('fetchPatientVaccinationsDetailRequest'));
// RESULTS (TEST RESULTS)
// export const fetchPatientTestResultsOnMount = (generateFetchListOnMount('fetchPatientTestResultsRequest'));
// export const fetchPatientTestResultsDetailOnMount = (generateFetchDetailOnMount('fetchPatientTestResultsDetailRequest'));
// Transfers of Care
// export const fetchPatientTransfersOfCareOnMount = (generateFetchListOnMount('fetchPatientTransfersOfCareRequest'));
// export const fetchPatientTransfersOfCareDetailOnMount = (generateFetchDetailOnMount('fetchPatientTransfersOfCareDetailRequest'));
// TopThreeThings
// export const fetchPatientTopThreeThingsOnMount = (generateFetchListOnMount('fetchPatientTopThreeThingsRequest'));
// export const fetchPatientTopThreeThingsSynopsisOnMount = (generateFetchListOnMount('fetchPatientTopThreeThingsSynopsisRequest'));
// export const fetchPatientTopThreeThingsDetailOnMount = (generateFetchDetailOnMount('fetchPatientTopThreeThingsDetailRequest'));
// PROMS
// export const fetchPatientPromsOnMount = (generateFetchListOnMount('fetchPatientPromsRequest'));
// export const fetchPatientPromsDetailOnMount = (generateFetchDetailOnMount('fetchPatientPromsDetailRequest'));

export const fetchFeedsOnMount = ({
  componentDidMount() {
    const { actions, match } = this.props;
    actions.fetchFeedsRequest();
  },
});
export const fetchFeedsDetailOnMount = ({
  componentDidMount() {
    const { actions, match } = this.props;
    const sourceId = _.get('params.sourceId', match);
    if (sourceId) actions.fetchFeedsDetailRequest({ sourceId });
  },
});

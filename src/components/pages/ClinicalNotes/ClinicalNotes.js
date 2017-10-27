import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import classNames from 'classnames';
import _ from 'lodash/fp';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { lifecycle, compose } from 'recompose';

import ClinicalNotesListHeader from './header/ClinicalNotesListHeader';
import SortableTable from '../../containers/SortableTable/SortableTable';
import { clinicalNotesColumnsConfig, defaultColumnsSelected } from './clinical-notes-table-columns.config'
import { fetchPatientClinicalNotesRequest } from './ducks/fetch-patient-clinical-notes.duck';
import { fetchPatientClinicalNotesDetailRequest } from './ducks/fetch-patient-clinical-notes-detail.duck';
import { fetchPatientClinicalNotesDetailEditRequest } from './ducks/fetch-patient-clinical-notes-detail-edit.duck';
import { fetchPatientClinicalNotesOnMount } from '../../../utils/HOCs/fetch-patients.utils';
import { patientClinicalNotesSelector, patientClinicalNotesDetailSelector, clinicalNotePanelFormSelector } from './selectors';
import { clientUrls } from '../../../config/client-urls.constants';
import PaginationBlock from '../../presentational/PaginationBlock/PaginationBlock';
import PTButton from '../../ui-elements/PTButton/PTButton';
import ClinicalNotesDetail from './ClinicalNotesDetail/ClinicalNotesDetail';

const CLINICAL_NOTES_MAIN = 'clinicalNotesMain';
const CLINICAL_NOTES_DETAIL = 'clinicalNotesDetail';
const CLINICAL_NOTES_CREATE = 'clinicalNotesCreate';
const CLINICAL_NOTES_PANEL = 'clinicalNotesPanel';

const mapDispatchToProps = dispatch => ({ actions: bindActionCreators({ fetchPatientClinicalNotesRequest, fetchPatientClinicalNotesDetailRequest, fetchPatientClinicalNotesDetailEditRequest }, dispatch) });

@connect(patientClinicalNotesSelector, mapDispatchToProps)
@connect(patientClinicalNotesDetailSelector, mapDispatchToProps)
@connect(clinicalNotePanelFormSelector)
@compose(lifecycle(fetchPatientClinicalNotesOnMount))
export default class ClinicalNotes extends PureComponent {
  static propTypes = {
    allClinicalNotes: PropTypes.arrayOf(PropTypes.object),
    clinicalNotesPerPageAmount: PropTypes.number,
  };

  static contextTypes = {
    router: PropTypes.shape({
      history: PropTypes.object,
    }),
  };

  static defaultProps = {
    clinicalNotesPerPageAmount: 10,
  };

  state = {
    nameShouldInclude: '',
    selectedColumns: defaultColumnsSelected,
    openedPanel: CLINICAL_NOTES_PANEL,
    columnNameSortBy: 'clinicalNotesType',
    sortingOrder: 'asc',
    expandedPanel: 'all',
    isBtnCreateVisible: true,
    isBtnExpandVisible: false,
    isAllPanelsVisible: false,
    isDetailPanelVisible: false,
    isSecondPanel: false,
    isCreatePanelVisible: false,
    editedPanel: {},
    offset: 0,
  };

  componentWillReceiveProps() {
    const sourceId = this.context.router.route.match.params.sourceId;
    const userId = this.context.router.route.match.params.userId;
    if (this.context.router.history.location.pathname === `${clientUrls.PATIENTS}/${userId}/${clientUrls.CLINICAL_NOTES}/${sourceId}` && sourceId !== undefined) {
      this.setState({ isSecondPanel: true, isDetailPanelVisible: true, isBtnExpandVisible: true, isBtnCreateVisible: true, isCreatePanelVisible: false })
    }
  }

  getClinicalNotesOnFirstPage = (clinicalNotes) => {
    const { offset } = this.state;
    const { clinicalNotesPerPageAmount } = this.props;

    return (_.size(clinicalNotes) > clinicalNotesPerPageAmount
      ? _.slice(offset, offset + clinicalNotesPerPageAmount)(clinicalNotes)
      : clinicalNotes)
  };

  handleExpand = (name, currentPanel) => {
    if (currentPanel === CLINICAL_NOTES_MAIN) {
      if (this.state.expandedPanel === 'all') {
        this.setState({ expandedPanel: name });
      } else {
        this.setState({ expandedPanel: 'all' });
      }
    } else if (this.state.expandedPanel === 'all') {
      this.setState({ expandedPanel: name, openedPanel: name });
    } else {
      this.setState({ expandedPanel: 'all' });
    }
  };

  handleFilterChange = ({ target: { value } }) => this.setState({ nameShouldInclude: _.toLower(value) });

  handleHeaderCellClick = (e, { name, sortingOrder }) => this.setState({ columnNameSortBy: name, sortingOrder });

  handleDetailDiagnosesClick = (id, name, sourceId) => {
    const { actions, userId } = this.props;
    this.setState({ isSecondPanel: true, isDetailPanelVisible: true, isBtnExpandVisible: true, isBtnCreateVisible: true, isCreatePanelVisible: false, openedPanel: CLINICAL_NOTES_PANEL, editedPanel: {} });
    actions.fetchPatientClinicalNotesDetailRequest({ userId, sourceId });
    this.context.router.history.replace(`${clientUrls.PATIENTS}/${userId}/${clientUrls.CLINICAL_NOTES}/${sourceId}`);
  };

  filterAndSortClinicalNotes = (clinicalNotes) => {
    const { columnNameSortBy, sortingOrder, nameShouldInclude } = this.state;
    const filterByClinicalNotesTypePredicate = _.flow(_.get('clinicalNotesType'), _.toLower, _.includes(nameShouldInclude));
    const filterByAuthorPredicate = _.flow(_.get('author'), _.toLower, _.includes(nameShouldInclude));
    const filterByDatePredicate = _.flow(_.get('dateCreated'), _.toLower, _.includes(nameShouldInclude));
    const filterBySourcePredicate = _.flow(_.get('source'), _.toLower, _.includes(nameShouldInclude));
    const reverseIfDescOrder = _.cond([
      [_.isEqual('desc'), () => _.reverse],
      [_.stubTrue, () => v => v],
    ])(sortingOrder);

    const filterByClinicalNotesType = _.flow(_.sortBy([columnNameSortBy]), reverseIfDescOrder, _.filter(filterByClinicalNotesTypePredicate))(clinicalNotes);
    const filterByAuthor = _.flow(_.sortBy([columnNameSortBy]), reverseIfDescOrder, _.filter(filterByAuthorPredicate))(clinicalNotes);
    const filterByDate = _.flow(_.sortBy([columnNameSortBy]), reverseIfDescOrder, _.filter(filterByDatePredicate))(clinicalNotes);
    const filterBySource = _.flow(_.sortBy([columnNameSortBy]), reverseIfDescOrder, _.filter(filterBySourcePredicate))(clinicalNotes);

    const filteredAndSortedClinicalNotes = [filterByClinicalNotesType, filterByAuthor,filterByDate, filterBySource].filter((item) => {
      return _.size(item) !== 0;
    });

    return _.head(filteredAndSortedClinicalNotes)
  };

  shouldHavePagination = clinicalNotes => _.size(clinicalNotes) > this.props.clinicalNotesPerPageAmount;

  handleSetOffset = offset => this.setState({ offset });

  handleCreate = (name) => {
    const { userId } = this.props;
    this.setState({ isBtnCreateVisible: false, isCreatePanelVisible: true, openedPanel: name, isSecondPanel: true, isDetailPanelVisible: false });
    this.context.router.history.replace(`${clientUrls.PATIENTS}/${userId}/${clientUrls.CLINICAL_NOTES}/create`);
  };

  handleEdit = (name) => {
    this.setState(prevState => ({
      editedPanel: {
        ...prevState.editedPanel,
        [name]: true,
      },
    }))
  };

  handleClinicalNotesDetailCancel = (name) => {
    this.setState(prevState => ({
      editedPanel: {
        ...prevState.editedPanel,
        [name]: false,
      },
    }))
  };

  render() {
    const { selectedColumns, columnNameSortBy, sortingOrder, isSecondPanel, isDetailPanelVisible, isBtnExpandVisible, expandedPanel, openedPanel, isBtnCreateVisible, isCreatePanelVisible, editedPanel, offset } = this.state;
    const { allClinicalNotes, clinicalNotesPerPageAmount, clinicalNoteDetail, clinicalNoteFormState } = this.props;

    const isPanelDetails = (expandedPanel === CLINICAL_NOTES_DETAIL || expandedPanel === CLINICAL_NOTES_PANEL);
    const isPanelMain = (expandedPanel === CLINICAL_NOTES_MAIN);
    const isPanelCreate = (expandedPanel === CLINICAL_NOTES_CREATE);

    const columnsToShowConfig = clinicalNotesColumnsConfig.filter(columnConfig => selectedColumns[columnConfig.key]);

    const filteredClinicalNotes = this.filterAndSortClinicalNotes(allClinicalNotes);
    const clinicalNotesOnFirstPage = _.flow(this.getClinicalNotesOnFirstPage)(filteredClinicalNotes);

    return (<section className="page-wrapper">
      <div className={classNames('section', { 'full-panel full-panel-main': isPanelMain, 'full-panel full-panel-details': (isPanelDetails || isPanelCreate) })}>
        <Row>
          {(isPanelMain || expandedPanel === 'all') ? <Col xs={12} className={classNames({ 'col-panel-main': isSecondPanel })}>
            <div className="panel panel-primary">
              <ClinicalNotesListHeader
                onFilterChange={this.handleFilterChange}
                panelTitle="Clinical Notes"
                isBtnExpandVisible={isBtnExpandVisible}
                name={CLINICAL_NOTES_MAIN}
                onExpand={this.handleExpand}
                currentPanel={CLINICAL_NOTES_MAIN}
              />
              <div className="panel-body">
                <SortableTable
                  headers={columnsToShowConfig}
                  data={clinicalNotesOnFirstPage}
                  resourceData={allClinicalNotes}
                  emptyDataMessage="No clinical notes"
                  onHeaderCellClick={this.handleHeaderCellClick}
                  onCellClick={this.handleDetailDiagnosesClick}
                  columnNameSortBy={columnNameSortBy}
                  sortingOrder={sortingOrder}
                  table="diagnoses"
                />
                <div className="panel-control">
                  <div className="wrap-control-group">
                    {this.shouldHavePagination(filteredClinicalNotes) &&
                    <div className="control-group with-indent left">
                      <PaginationBlock
                        entriesPerPage={clinicalNotesPerPageAmount}
                        totalEntriesAmount={_.size(allClinicalNotes)}
                        offset={offset}
                        setOffset={this.handleSetOffset}
                      />
                    </div>
                    }
                    <div className="control-group with-indent right">
                      {isBtnCreateVisible ? <PTButton className="btn btn-success btn-inverse btn-create" onClick={() => this.handleCreate(CLINICAL_NOTES_CREATE)}>
                        <i className="btn-icon fa fa-plus" />
                        <span className="btn-text"> Create</span>
                      </PTButton> : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Col> : null }
          {(expandedPanel === 'all' || isPanelDetails) && isDetailPanelVisible && !isCreatePanelVisible ? <Col xs={12} className={classNames({ 'col-panel-details': isSecondPanel })}>
            <ClinicalNotesDetail
              onExpand={this.handleExpand}
              name={CLINICAL_NOTES_DETAIL}
              openedPanel={openedPanel}
              expandedPanel={expandedPanel}
              currentPanel={CLINICAL_NOTES_DETAIL}
              detail={clinicalNoteDetail}
              onEdit={this.handleEdit}
              editedPanel={editedPanel}
              onCancel={this.handleClinicalNotesDetailCancel}
              onSaveSettings={this.handleSaveSettingsDetailForm}
              clinicalNoteFormValues={clinicalNoteFormState.values}
            />
          </Col> : null}
        </Row>
      </div>
    </section>)
  }
}
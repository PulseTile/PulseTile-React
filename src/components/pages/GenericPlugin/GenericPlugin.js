import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import classNames from 'classnames';
import _ from 'lodash/fp';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { lifecycle, compose } from 'recompose';

import PluginListHeader from '../../plugin-page-component/PluginListHeader';
import PluginCreate from '../../plugin-page-component/PluginCreate';
import PluginMainPanel from '../../plugin-page-component/PluginMainPanel';
import GenericPluginCreateForm from './GenericPluginCreate/GenericPluginCreateForm';
import { columnsConfig, defaultColumnsSelected } from './table-columns.config'
import { fetchPatientGenericPluginRequest } from './ducks/fetch-patient-generic-plugin.duck';
import { fetchPatientGenericPluginDetailRequest } from './ducks/fetch-patient-generic-plugin-detail.duck';
import { fetchPatientGenericPluginDetailEditRequest } from './ducks/fetch-patient-generic-plugin-detail-edit.duck';
import { fetchPatientGenericPluginCreateRequest } from './ducks/fetch-patient-generic-plugin-create.duck';
import { fetchPatientGenericPluginOnMount } from '../../../utils/HOCs/fetch-patients.utils';
import { patientGenericPluginSelector, patientGenericPluginDetailSelector, genericPluginDetailFormSelector, genericPluginCreateFormStateSelector } from './selectors';
import { clientUrls } from '../../../config/client-urls.constants';
import GenericPluginDetail from './GenericPluginDetail/GenericPluginDetail';
import { valuesNames } from './forms.config';
import { getDDMMMYYYY } from '../../../utils/time-helpers.utils';
import { checkIsValidateForm } from '../../../utils/plugin-helpers.utils';

const GENERIC_PLUGIN_MAIN = 'genericPluginsMain';
const GENERIC_PLUGIN_DETAIL = 'genericPluginsDetail';
const GENERIC_PLUGIN_CREATE = 'genericPluginsCreate';
const GENERIC_PLUGIN_PANEL = 'genericPluginsPanel';

const mapDispatchToProps = dispatch => ({ actions: bindActionCreators({ fetchPatientGenericPluginRequest, fetchPatientGenericPluginDetailRequest, fetchPatientGenericPluginDetailEditRequest, fetchPatientGenericPluginCreateRequest }, dispatch) });

@connect(patientGenericPluginSelector, mapDispatchToProps)
@connect(patientGenericPluginDetailSelector, mapDispatchToProps)
@connect(genericPluginDetailFormSelector)
@connect(genericPluginCreateFormStateSelector)
@compose(lifecycle(fetchPatientGenericPluginOnMount))
export default class GenericPlugin extends PureComponent {
  static propTypes = {
    allGenericPlugin: PropTypes.arrayOf(PropTypes.object),
  };

  static contextTypes = {
    router: PropTypes.shape({
      history: PropTypes.object,
    }),
  };

  state = {
    nameShouldInclude: '',
    selectedColumns: defaultColumnsSelected,
    openedPanel: GENERIC_PLUGIN_PANEL,
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
    isSubmit: false,
  };

  componentWillReceiveProps() {
    const sourceId = this.context.router.route.match.params.sourceId;
    const userId = this.context.router.route.match.params.userId;
    if (this.context.router.history.location.pathname === `${clientUrls.PATIENTS}/${userId}/${clientUrls.GENERIC_PLUGIN}/${sourceId}` && sourceId !== undefined) {
      this.setState({ isSecondPanel: true, isDetailPanelVisible: true, isBtnExpandVisible: true, isBtnCreateVisible: true, isCreatePanelVisible: false })
    }
  }

  handleExpand = (name, currentPanel) => {
    if (currentPanel === GENERIC_PLUGIN_MAIN) {
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

  handleDetailGenericPluginClick = (id, name, sourceId) => {
    const { actions, userId } = this.props;
    this.setState({ isSecondPanel: true, isDetailPanelVisible: true, isBtnExpandVisible: true, isBtnCreateVisible: true, isCreatePanelVisible: false, openedPanel: GENERIC_PLUGIN_PANEL, editedPanel: {}, expandedPanel: 'all' });
    actions.fetchPatientGenericPluginDetailRequest({ userId, sourceId });
    this.context.router.history.replace(`${clientUrls.PATIENTS}/${userId}/${clientUrls.GENERIC_PLUGIN}/${sourceId}`);
  };

  filterAndSortGenericPlugin = (genericPlugins) => {
    const { columnNameSortBy, sortingOrder, nameShouldInclude } = this.state;
    const filterByGenericPluginTypePredicate = _.flow(_.get('clinicalNotesType'), _.toLower, _.includes(nameShouldInclude));
    const filterByAuthorPredicate = _.flow(_.get('author'), _.toLower, _.includes(nameShouldInclude));
    const filterByDatePredicate = _.flow(_.get('dateCreated'), _.toLower, _.includes(nameShouldInclude));
    const filterBySourcePredicate = _.flow(_.get('source'), _.toLower, _.includes(nameShouldInclude));
    const reverseIfDescOrder = _.cond([
      [_.isEqual('desc'), () => _.reverse],
      [_.stubTrue, () => v => v],
    ])(sortingOrder);

    if (genericPlugins !== undefined) {
      genericPlugins.map((item) => {
        item.dateCreated = getDDMMMYYYY(item.dateCreated);
      });
    }

    const filterByGenericPluginType = _.flow(_.sortBy([item => item[columnNameSortBy].toString().toLowerCase()]), reverseIfDescOrder, _.filter(filterByGenericPluginTypePredicate))(genericPlugins);
    const filterByAuthor = _.flow(_.sortBy([item => item[columnNameSortBy].toString().toLowerCase()]), reverseIfDescOrder, _.filter(filterByAuthorPredicate))(genericPlugins);
    const filterByDate = _.flow(_.sortBy([columnNameSortBy]), reverseIfDescOrder, _.filter(filterByDatePredicate))(genericPlugins);
    const filterBySource = _.flow(_.sortBy([columnNameSortBy]), reverseIfDescOrder, _.filter(filterBySourcePredicate))(genericPlugins);

    const filteredAndSortedGenericPlugin = [filterByGenericPluginType, filterByAuthor, filterByDate, filterBySource].filter((item) => {
      return _.size(item) !== 0;
    });

    return _.head(filteredAndSortedGenericPlugin)
  };

  handleSetOffset = offset => this.setState({ offset });

  handleCreate = () => {
    const { userId } = this.props;
    this.setState({ isBtnCreateVisible: false, isCreatePanelVisible: true, openedPanel: GENERIC_PLUGIN_CREATE, isSecondPanel: true, isDetailPanelVisible: false, isBtnExpandVisible: true, expandedPanel: 'all', isSubmit: false });
    this.context.router.history.replace(`${clientUrls.PATIENTS}/${userId}/${clientUrls.GENERIC_PLUGIN}/create`);
  };

  handleEdit = (name) => {
    this.setState(prevState => ({
      editedPanel: {
        ...prevState.editedPanel,
        [name]: true,
      },
      isSubmit: false,
    }))
  };

  handleGenericPluginDetailCancel = (name) => {
    this.setState(prevState => ({
      editedPanel: {
        ...prevState.editedPanel,
        [name]: false,
      },
      isSubmit: false,
    }))
  };

  handleSaveSettingsDetailForm = (formValues, name) => {
    const { actions, genericPluginFormState } = this.props;
    if (checkIsValidateForm(genericPluginFormState)) {
      actions.fetchPatientGenericPluginDetailEditRequest(this.formValuesToString(formValues, 'edit'));
      this.setState(prevState => ({
        editedPanel: {
          ...prevState.editedPanel,
          [name]: false,
        },
        isSubmit: false,
      }))
    } else {
      this.setState({ isSubmit: true });
    }
  };

  handleCreateCancel = () => {
    const { userId } = this.props;
    this.setState({ isBtnCreateVisible: true, isCreatePanelVisible: false, openedPanel: GENERIC_PLUGIN_PANEL, isSecondPanel: false, isBtnExpandVisible: false, expandedPanel: 'all', isSubmit: false });
    this.context.router.history.replace(`${clientUrls.PATIENTS}/${userId}/${clientUrls.GENERIC_PLUGIN}`);
  };

  handleSaveSettingsCreateForm = (formValues) => {
    const { actions, userId, genericPluginCreateFormState } = this.props;
    if (checkIsValidateForm(genericPluginCreateFormState)) {
      actions.fetchPatientGenericPluginCreateRequest(this.formValuesToString(formValues, 'create'));
      setTimeout(() => actions.fetchPatientGenericPluginRequest({userId}), 1000);
      this.context.router.history.replace(`${clientUrls.PATIENTS}/${userId}/${clientUrls.GENERIC_PLUGIN}`);
      this.hideCreateForm();
    } else {
      this.setState({ isSubmit: true });
    }
  };

  formValuesToString = (formValues, formName) => {
    const { userId, genericPluginDetail } = this.props;
    const clinicalNotesType = _.get(valuesNames.GENERIC_PLUGIN_TYPE)(formValues);
    const note = _.get(valuesNames.NOTE)(formValues);
    const author = _.get(valuesNames.AUTHOR)(formValues);

    if (formName === 'create') {
      const source = _.get(valuesNames.SOURCE)(formValues);
      return ({ clinicalNotesType, note, author, source, userId });
    }
    if (formName === 'edit') {
      const date = _.get(valuesNames.DATE)(formValues);
      const sourceId = genericPluginDetail.sourceId;
      const source = genericPluginDetail.source;
      return ({ clinicalNotesType, note, author, date, sourceId, source, userId });
    }
  };

  hideCreateForm = () => {
    this.setState({ isBtnCreateVisible: true, isCreatePanelVisible: false, openedPanel: GENERIC_PLUGIN_PANEL, isSecondPanel: false, expandedPanel: 'all', isBtnExpandVisible: false })
  };

  render() {
    const { selectedColumns, columnNameSortBy, sortingOrder, isSecondPanel, isDetailPanelVisible, isBtnExpandVisible, expandedPanel, openedPanel, isBtnCreateVisible, isCreatePanelVisible, editedPanel, offset, isSubmit } = this.state;
    const { allGenericPlugin, genericPluginDetail, genericPluginFormState, genericPluginCreateFormState } = this.props;

    const isPanelDetails = (expandedPanel === GENERIC_PLUGIN_DETAIL || expandedPanel === GENERIC_PLUGIN_PANEL);
    const isPanelMain = (expandedPanel === GENERIC_PLUGIN_MAIN);
    const isPanelCreate = (expandedPanel === GENERIC_PLUGIN_CREATE);

    const columnsToShowConfig = columnsConfig.filter(columnConfig => selectedColumns[columnConfig.key]);

    const filteredGenericPlugin = this.filterAndSortGenericPlugin(allGenericPlugin);

    return (<section className="page-wrapper">
      <div className={classNames('section', { 'full-panel full-panel-main': isPanelMain, 'full-panel full-panel-details': (isPanelDetails || isPanelCreate) })}>
        <Row>
          {(isPanelMain || expandedPanel === 'all') ? <Col xs={12} className={classNames({ 'col-panel-main': isSecondPanel })}>
            <div className="panel panel-primary">
              <PluginListHeader
                onFilterChange={this.handleFilterChange}
                panelTitle="Generic Plugin List"
                isBtnExpandVisible={isBtnExpandVisible}
                isBtnTableVisible
                name={GENERIC_PLUGIN_MAIN}
                onExpand={this.handleExpand}
                currentPanel={GENERIC_PLUGIN_MAIN}
              />
              <PluginMainPanel
                headers={columnsToShowConfig}
                resourceData={allGenericPlugin}
                emptyDataMessage="No Generic Plugin List"
                onHeaderCellClick={this.handleHeaderCellClick}
                onCellClick={this.handleDetailGenericPluginClick}
                columnNameSortBy={columnNameSortBy}
                sortingOrder={sortingOrder}
                table="genericPlugins"
                filteredData={filteredGenericPlugin}
                totalEntriesAmount={_.size(allGenericPlugin)}
                offset={offset}
                setOffset={this.handleSetOffset}
                isBtnCreateVisible={isBtnCreateVisible}
                onCreate={this.handleCreate}
              />
            </div>
          </Col> : null }
          {(expandedPanel === 'all' || isPanelDetails) && isDetailPanelVisible && !isCreatePanelVisible ? <Col xs={12} className={classNames({ 'col-panel-details': isSecondPanel })}>
            <GenericPluginDetail
              onExpand={this.handleExpand}
              name={GENERIC_PLUGIN_DETAIL}
              openedPanel={openedPanel}
              expandedPanel={expandedPanel}
              currentPanel={GENERIC_PLUGIN_DETAIL}
              detail={genericPluginDetail}
              onEdit={this.handleEdit}
              editedPanel={editedPanel}
              onCancel={this.handleGenericPluginDetailCancel}
              onSaveSettings={this.handleSaveSettingsDetailForm}
              genericPluginFormValues={genericPluginFormState.values}
              isSubmit={isSubmit}
            />
          </Col> : null}
          {(expandedPanel === 'all' || isPanelCreate) && isCreatePanelVisible && !isDetailPanelVisible ? <Col xs={12} className={classNames({ 'col-panel-details': isSecondPanel })}>
            <PluginCreate
              onExpand={this.handleExpand}
              name={GENERIC_PLUGIN_CREATE}
              openedPanel={openedPanel}
              onShow={this.handleShow}
              expandedPanel={expandedPanel}
              currentPanel={GENERIC_PLUGIN_CREATE}
              onSaveSettings={this.handleSaveSettingsCreateForm}
              formValues={genericPluginCreateFormState.values}
              onCancel={this.handleCreateCancel}
              isCreatePanelVisible={isCreatePanelVisible}
              componentForm={
                <GenericPluginCreateForm isSubmit={isSubmit} />
              }
              title="Create Generic Plugin"
            />
          </Col> : null}
        </Row>
      </div>
    </section>)
  }
}
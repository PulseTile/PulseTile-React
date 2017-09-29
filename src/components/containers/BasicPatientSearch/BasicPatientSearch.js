import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import qs from 'qs';

import PTButton from '../../ui-elements/PTButton/PTButton';
import { clientUrls } from '../../../config/client-urls.constants';

export default class BasicPatientSearch extends PureComponent {
    state = {
      searchString: '',
    };

    static contextTypes = {
      router: PropTypes.shape({
        history: PropTypes.object,
      }),
    };

    handleSearchStringChange = event => this.setState({ searchString: event.target.value });

    handleClearSearchString = () => this.setState({ searchString: '' });

    handleSearchClick = () => {
      const { searchString } = this.state;
      if (searchString) {
        const queryParams = {
          orderType: 'ASC',
          pageNumber: 1,
          searchString,
          queryType: 'Patient: ',
        };
        const patientsFullDetailsUrl = `${clientUrls.PATIENTS_FULL_DETAILS}?${qs.stringify(queryParams)}`;

        this.context.router.history.replace(patientsFullDetailsUrl);
      }
    };

    handleKeyPress = ({ key }) => key === 'Enter' && this.handleSearchClick();

    render() {
      const { searchString } = this.state;

      return (
        <div>
          <PTButton className="btn btn-search" onClick={this.handleSearchClick}>
            <i className="btn-icon fa fa-search" />
          </PTButton>
          <div className="wrap-search-holder">
            <div className="search-holder">
              <form>
                <input className="form-control" placeholder="Search" type="text" value={searchString} onChange={this.handleSearchStringChange} onKeyPress={this.handleKeyPress} />
              </form>
              {/*TODO: should be button*/}
              { searchString && <i className="clearAll fa fa-times-circle" onClick={this.handleClearSearchString} />}
            </div>
          </div>
        </div>
      )
    }
}
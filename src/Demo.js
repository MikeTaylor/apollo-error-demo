import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import queryString from 'query-string';

const GET_INSTANCES = gql`
query allInstances ($cql: String) {
  instances (cql: $cql) {
    records {
     id,
     source,
     title,
     instanceTypeId,
     instanceType { name },
    }
    totalCount
  }
}
`;

class Demo extends Component {
  changeCql() {
    const cql = document.getElementById('cql').value;
    this.props.history.push(`?cql=${encodeURIComponent(cql)}`);
  }

  render() {
    const data = this.props.data;
    return (
      <span>
        <h1>Demo: Apollo error handling</h1>

        <div>
          CQL: <input type="text" id="cql" name="cql" />
          <button onClick={e => this.changeCql(e)}>Search!</button>
        </div>

        <div>
        {
          !data ? 'No data' :
          data.loading ? 'Loading ...' : (
            <span>
              <div>
                {data.instances ? `Found ${data.instances.totalCount} records` : 'No instances'}
              </div>
              <div>
                {data.error ? data.error.message : 'No errors'}
              </div>
            </span>
          )
        }
        </div>
      </span>
    );
  }
}

export default withRouter(graphql(GET_INSTANCES, {
  options: props => ({
    errorPolicy: 'none',
    variables: {
      cql: queryString.parse(props.location.search || '').cql
    },
  }),
})(Demo));

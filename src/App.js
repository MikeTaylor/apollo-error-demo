import React, { Component } from 'react';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloProvider } from 'react-apollo';
import { BrowserRouter } from 'react-router-dom'

import Demo from './Demo';

const okapi = {
  url: 'http://localhost:9130',
  tenant: 'diku',
  token: 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJkaWt1X2FkbWluIiwidXNlcl9pZCI6IjFhZDczN2IwLWQ4NDctMTFlNi1iZjI2LWNlYzBjOTMyY2UwMSIsInRlbmFudCI6ImRpa3UifQ.DfZt79Tr9uLqYIJq41HB3JdopKzl8Vy18UxUTBLMGGQxUmOzhCjcimHzS9N7ZVW_fw5SmZPjlO_aEO6_cJTYuQ',
};

const client = new ApolloClient({
  link: new HttpLink({
    uri: `${okapi.url}/graphql`,
    headers: {
      'X-Okapi-Tenant': okapi.tenant,
      'X-Okapi-Token': okapi.token,
    },
  }),
  cache: new InMemoryCache(),
});

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <ApolloProvider client={client}>
          <Demo />
        </ApolloProvider>
      </BrowserRouter>
    );
  }
}

export default App;

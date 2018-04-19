# `apollo-error-demo` - Apollo returns records along with errors

I am using Okapi, mod-graphql and mod-inventory-storage because that combination of software is what I have to hand that knows how to answer GraphQL queries. I assume that the behaviour I am seeing here will be the same with any othe GraphQL service that can be coerced into returning errors.

**Note.** [`src/App.js`](src/App.js) contains a hardwired Okapi token. You will need to replace this with one that is valid for the Okapi service you are using.


## Findings

Here I try sequences of good CQL queries (like `title=a*` or `title=b*`) and bad queries (like `x` -- which is syntactially fine, but rejected by the CQL translator in mod-inventory because it doesn't specify a fieldname to search in).

The goal is to see how Apollo reports the results of various sequences of operations.


### 1. `errorPolicy` set to `none` (the default)

* Start up at http://localhost:3001/ with no query: 118 records, no errors.
* Search for `title=a*`: 35 records, no errors.
* Search for `title=b*`: 23 records, no errors.
* Search for `x`: the error is correctly reported ("GraphQL error: org.z3950.zing.cql.cql2pgjson.QueryValidationException: cql.serverChoice requested, but no serverChoiceIndexes defined") but we continue to receive 23 records in the props -- even though the HTTP response contains `"data":{"instances":null}`.
* Search for `title=a*` again: no change in either the record-count or the error. **This has to be wrong**
* Search for `title=b*` again: no change in either the record-count or the error. **This has to be wrong**
* Search for `title=c*` (which, note, is not in the cache): 24 records, no error.
* Search for `title=a*`: 35 records, no errors.
* Search for `title=b*`: 23 records, no errors.

Conclusion: all is well until the first error. At that point we are wrongly served with the previous set of records as well as the diagnostic. Thereafter, all attempts to re-do previous (cached) searches have no effect on the props we are given. Only after a new search is performed, forcing a new HTTP request/response, is this behaviour reset, and all is then well again -- including access to the previously cached response.


### 2. `errorPolicy` set to `ignore`

Completely useless: errors are never reported.


### 3. `errorPolicy` set to `all`

* Start up at http://localhost:3001/ with no query: 118 records, no errors.
* Search for `title=a*`: 35 records, no errors.
* Search for `title=b*`: 23 records, no errors.
* Search for `x`: the error is correctly reported ("GraphQL error: org.z3950.zing.cql.cql2pgjson.QueryValidationException: cql.serverChoice requested, but no serverChoiceIndexes defined") and we get no records.
* Search for `title=a*` again: 35 records (correct), but we get the same, no-longer-relevant, error reported.
* Search for `title=b*` again: 23 records (correct), but we get the same, no-longer-relevant, error reported.
* Search for `title=c*` (which, note, is not in the cache): 24 records, no error.
* Search for `title=a*`: 35 records, no errors.
* Search for `title=b*`: 23 records, no errors.

So this works the same as `none` until the error on the query `x`. At this point, the error is reported and no records are presented, which is an improvement. _However_, once the error has occurred, it doesn't get cleared until a non-cached search is executed: re-running already-cached queries does give us back the correct record-counts (unlike `errorPolicy:none`, but also keeps giving us the stale error. As with `none`, running a new, non-cached, search clears this up.



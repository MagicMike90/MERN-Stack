import * as types from './actionTypes'
import {
  addNotification
} from './notificationActions'
import issueApi from '../api/IssuesApi';
import queryString from 'query-string';
import reduxStore from '../store/reduxStore';



export const requestIssuesError = error => ({
  type: types.REQUEST_SERVER_ERROR,
  error: error,
  receivedAt: Date.now()
});

export const sendRequest = () => ({
  type: types.SEND_REQUEST
})

export const requestIssuesSuccess = data => ({
  type: types.LOAD_ISSUES_SUCCESS,
  data,
  receivedAt: Date.now()
});
export const createIssueSuccess = (issue, history) => {
  history.push({
    pathname: `/issues/${issue._id}`
  })
  return {
    type: types.CREATE_ISSUE_SUCCESS,
    issue,
    receivedAt: Date.now()
  }
};
export const deleteIssueSuccess = (issueIds, history) => ({
  type: types.DELETE_ISSUE_SUCCESS,
  issueIds,
  receivedAt: Date.now()
});

// export const nextIssuePage = (location) => {
//   const query = Object.assign({}, qs.parse(location.search));
//   const pageStr = (parseInt(query._page, 10) + 1);

//   let query_string = qs.stringify({ _page: pageStr });


//   location.history.push({ pathname: location.pathname, search: query_string });

//   return {
//     type: types.NEXT_ISSUE_PAGE,
//     issueIds,
//     receivedAt: Date.now()
//   }
// };


const convertedIssue = issue => {
  issue.created = new Date(issue.created);
  if (issue.completionDate) {
    issue.completionDate = new Date(issue.completionDate);
  }
  return issue;
}
export const fetchIssues = (location, page_size) => dispatch => {

  const query = Object.assign({}, queryString.parse(location.search));

  const pageStr = query._page;
  if (pageStr) {
    delete query._page;
    query._offset = (parseInt(pageStr, 10) - 1) * page_size;
  }
  query._limit = page_size;

  const search = Object.keys(query).map(k => `${k}=${query[k]}`).join('&');

  dispatch(sendRequest());
  return issueApi.getAllIssues(search).then(response => {
    if (!response.ok) return response.json().then(error => Promise.reject(error));
    response.json().then(data => {
      const issues = data.records;
      issues.forEach(issue => {
        issue.created = new Date(issue.created);
        if (issue.completionDate) {
          issue.completionDate = new Date(issue.completionDate);
        }
      });

      dispatch(requestIssuesSuccess({
        pageNum: pageStr ? parseInt(pageStr) : 1,
        issues,
        totalCount: data.metadata.totalCount
      }));
      dispatch(addNotification('Load issues successfully', 'success'));

    });
  }).catch(err => {
    const errorMsg = `Error in fetching data from server: ${err}`;
    console.log('errorMsg', errorMsg);
    dispatch(requestIssuesError(errorMsg))
    dispatch(addNotification(errorMsg, 'error'));
  });
};

const shouldFetchIssues = (state) => {
  const issuesState = state.issuesState;
  if (issuesState.issues.length == 0) {
    return true
  }
  if (issuesState.isFetching) {
    return false;
  }
  return issuesState.failed;
}
export const fetchIssuesIfNeeded = (location, page_size) => (dispatch, getState) => {

  if (shouldFetchIssues(getState())) {
    return dispatch(fetchIssues(location, page_size));
  }
}

export const createIssue = (issue, history) => {
  return dispatch => {
    dispatch(sendRequest());

    issueApi.createIssue(issue).then(response => {
      if (!response.ok) {
        return response.json().then(error => {
          const errorMsg = `Failed to add issue: ${error.message}`;
          dispatch(requestIssuesError(errorMsg))
          dispatch(addNotification(errorMsg, 'error'));;
        });
      }
      response.json().then(updatedIssue => {
        updatedIssue = convertedIssue(updatedIssue);
        dispatch(createIssueSuccess(updatedIssue, history));
        dispatch(addNotification('Create issue successfully', 'success'));
      })
    }).catch(error => {
      const errorMsg = `Error in sending data to server: ${error.message}`;
      dispatch(requestIssuesError(errorMsg))
    });
  }
}
export const deleteIssue = (issue, history) => {
  return dispatch => {
    dispatch(sendRequest());
    issueApi.deleteIssue(issue).then(response => {
      if (!response.ok) {
        return response.json().then(error => {
          const errorMsg = `Failed to delete issue`;
          dispatch(requestIssuesError(errorMsg))
        });
      }
      return dispatch(deleteIssueSuccess(issue, history));
    }).catch(error => {
      const errorMsg = `Error in sending data to server: ${error.message}`;
      dispatch(requestIssuesError(errorMsg))
    });
  }
}
export const deleteBulkIssue = (issueIds, history) => {
  return dispatch => {
    dispatch(sendRequest());
    issueApi.deleteBulkIssue(issueIds).then(response => {
      if (!response.ok) {
        return response.json().then(error => {
          const errorMsg = `Failed to delete issue`;
          dispatch(requestIssuesError(errorMsg))
        });
      }
      return dispatch(deleteIssueSuccess(issueIds, history));
    }).catch(error => {
      const errorMsg = `Error in sending data to server: ${error.message}`;
      dispatch(requestIssuesError(errorMsg))
    });
  }
}

// export const deleteBulkIssue = (issueIds, history) => {
// }
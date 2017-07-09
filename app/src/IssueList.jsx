
import React from 'react';
import 'whatwg-fetch';
import { Link } from 'react-router-dom';
import queryString from 'query-string';

import IssueAdd from './IssueAdd.jsx'
import IssueFilter from './IssueFilter.jsx'

class IssueRow extends React.Component {
    render() {
        const issue = this.props.issue;
        return (
            <tr>
                <td><Link to={`/issues/${issue._id}`}>
                    {issue._id.substr(-4)}</Link></td>
                <td>{issue.status}</td>
                <td>{issue.owner}</td>
                <td>{issue.created.toDateString()}</td>
                <td>{issue.effort}</td>
                <td>{issue.completionDate ?
                    issue.completionDate.toDateString() : ''}</td>
                <td>{issue.title}</td>
            </tr>
        )
    }
}
class IssueTable extends React.Component {
    render() {
        const borderedStyle = { border: "1px solid silver", padding: 6 };
        const issueRows = this.props.issues.map(issue => <IssueRow key={issue._id} issue={issue} />)
        return (
            <table className="bordered-table">
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Status</th>
                        <th>Owner</th>
                        <th>Created</th>
                        <th>Effort</th>
                        <th>Completion Date</th>
                        <th>Title</th>
                    </tr>
                </thead>
                <tbody>{issueRows}</tbody>
            </table>
        )
    }
}
export default class IssueList extends React.Component {
    constructor() {
        super();
        this.state = { issues: [] };
        this.createIssue = this.createIssue.bind(this);
        this.setFilter = this.setFilter.bind(this);
    }
    componentDidMount() {
        this.loadData();
    }
    componentDidUpdate(prevProps) {
        const oldQuery = queryString.parse(prevProps.location.search);
        const newQuery = queryString.parse(this.props.location.search);

        if (newQuery === undefined) return;

        if (oldQuery.status === newQuery.status
            && oldQuery.effort_gte === newQuery.effort_gte
            && oldQuery.effort_lte === newQuery.effort_lte) {
            return;
        }
        console.log('componentDidUpdate', 'loadData');
        this.loadData();
    }
    loadData() {
        console.log('this.props.location', this.props.location);
        fetch(`/api/issues${this.props.location.search}`).then(response => {
            if (response.ok) {
                response.json().then(data => {
                    console.log("Total count of records:", data._metadata.total_count);
                    data.records.forEach(issue => {
                        issue.created = new Date(issue.created);
                        if (issue.completionDate)
                            issue.completionDate = new Date(issue.completionDate);
                    });
                    this.setState({
                        issues: data.records
                    });
                });
            } else {
                response.json().then(error => {
                    alert("Failed to fetch issues:" + error.message)
                });
            }
        }).catch(err => {
            alert("Error in fetching data from server:", err);
        });
    }
    setFilter(query) {
        // console.log('setFilter',this.props);
        let qs = queryString.stringify(query);
        this.props.history.push({ pathname: this.props.location.pathname, search: qs })
        // this.props.router.push({ pathname: this.props.location.pathname, query });
    }
    createIssue(newIssue) {
        fetch('/api/issues', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newIssue),
        }).then(response => {
            if (response.ok) {
                response.json().then(updatedIssue => {
                    updatedIssue.created = new Date(updatedIssue.created);
                    if (updatedIssue.completionDate)
                        updatedIssue.completionDate = new Date(updatedIssue.completionDate);
                    const newIssues = this.state.issues.concat(updatedIssue);
                    this.setState({
                        issues: newIssues
                    });
                });
            } else {
                response.json().then(error => {
                    alert("Failed to add issue: " + error.message)
                });
            }
        }).catch(err => {
            alert("Error in sending data to server: " + err.message);
        });
    }
    render() {
        let initFilter = queryString.parse(this.props.location.search);
        return (
            <div>
                <IssueFilter setFilter={this.setFilter} initFilter={initFilter}/>
                <hr />
                <IssueTable issues={this.state.issues} />
                <hr />
                <IssueAdd createIssue={this.createIssue} />
            </div>
        );
    }
}
IssueList.propTypes = {
    location: React.PropTypes.object.isRequired
};

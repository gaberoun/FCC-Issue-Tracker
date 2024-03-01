const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const res = require('express/lib/response');

chai.use(chaiHttp);

var issueTest;

suite('Functional Tests', function() {

    suite("POST request Tests", function () {
        test("Create an issue with every field", (done) => {
            chai
            .request(server)
            .post("/api/issues/test")
            .send({
                issue_title: 'Title',
                issue_text: 'text',
                created_by: 'Test - all fields',
                assigned_to: 'User Test',
                status_text: 'QA testing'
            })
            .end(function(err, res) {
                assert.equal(res.status, 200)
                assert.equal(res.body.issue_title, 'Title')
                assert.equal(res.body.issue_text, 'text')
                assert.equal(res.body.created_by, 'Test - all fields')
                assert.equal(res.body.assigned_to, 'User Test')
                assert.equal(res.body.status_text, 'QA testing')
                issueTest = res.body;
                done()
            })
        });
        test("Create an issue with only required fields", (done) => {
            chai
                .request(server)
                .post("/api/issues/test")
                .send({
                    issue_title: 'Title',
                    issue_text: 'text',
                    created_by: 'Test - required fields',
                })
                .end(function(err, res) {
                    assert.equal(res.status, 200)
                    assert.equal(res.body.issue_title, 'Title')
                    assert.equal(res.body.issue_text, 'text')
                    assert.equal(res.body.created_by, 'Test - required fields')
                    assert.equal(res.body.assigned_to, '')
                    assert.equal(res.body.status_text, '')
                    assert.equal(res.body.open, true)
                    done()
                })
        });
        test("Create an issue with missing required fields", (done) => {
            chai
                .request(server)
                .post("/api/issues/test")
                .send({
                    issue_title: 'Title',
                    issue_text: 'text'
                })
                .end(function(err, res) {
                    assert.equal(res.status, 200)
                    assert.equal(res.body.error, 'required field(s) missing')
                    done()
                })
        });
    })

    suite("GET request Tests", function () {
        test("View issues on a project", (done) => {
            chai
                .request(server)
                .get("/api/issues/test")
                .end(function(err, res) {
                    assert.equal(res.status, 200)
                    done()
                })
        });
        test("View issues on a project with one filter", (done) => {
            chai
                .request(server)
                .get("/api/issues/test")
                .query({
                    assigned_to: issueTest.assigned_to
                })
                .end(function(err, res) {
                    assert.equal(res.status, 200)
                    assert.equal(res.body[0].issue_title, issueTest.issue_title);
                    assert.equal(res.body[0].issue_text, issueTest.issue_text);
                    done()
                })
        });
        test("View issues on a project with multiple filters", (done) => {
            chai
                .request(server)
                .get("/api/issues/test")
                .query({
                    assigned_to: issueTest.assigned_to,
                    issue_title: issueTest.issue_title
                })
                .end(function(err, res) {
                    assert.equal(res.status, 200)
                    assert.equal(res.body[0].issue_title, issueTest.issue_title);
                    assert.equal(res.body[0].issue_text, issueTest.issue_text);
                    done()
                })
        });
    })

    suite("PUT request Tests", function () {
        test("Update one field on an issue", (done) => {
            chai
                .request(server)
                .put("/api/issues/test")
                .send({
                    _id: issueTest._id,
                    status_text: "update 1 test"
                })
                .end(function(err, res) {
                    assert.equal(res.status, 200)
                    assert.equal(res.body.result, 'successfully updated');
                    done()
                })
        });
        test("Update multiple fields on an issue", (done) => {
            chai
                .request(server)
                .put("/api/issues/test")
                .send({
                    _id: issueTest._id,
                    status_text: "update multiple test",
                    assigned_to: 'Update test user'
                })
                .end(function(err, res) {
                    assert.equal(res.status, 200)
                    assert.equal(res.body.result, 'successfully updated');
                    done()
                })
        });
        test("Update an issue with missing _id", (done) => {
            chai
                .request(server)
                .put("/api/issues/test")
                .send({
                    status_text: "update missing _id test",
                    assigned_to: 'Update test user'
                })
                .end(function(err, res) {
                    assert.equal(res.status, 200)
                    assert.equal(res.body.error, 'missing _id');
                    done()
                })
        });
        test("Update an issue with no fields to update", (done) => {
            chai
                .request(server)
                .put("/api/issues/test")
                .send({
                    _id: issueTest._id
                })
                .end(function(err, res) {
                    assert.equal(res.status, 200)
                    assert.equal(res.body.error, 'no update field(s) sent');
                    done()
                })
        });
        test("Update an issue with an invalid _id", (done) => {
            chai
                .request(server)
                .put("/api/issues/test")
                .send({
                    _id: "123",
                    status_text: "update invalid _id"
                })
                .end(function(err, res) {
                    assert.equal(res.status, 200)
                    assert.equal(res.body.error, 'could not update');
                    done()
                })
        });
    })

    suite("DELETE request Tests", function () {
        test("Delete an issue", (done) => {
            chai
                .request(server)
                .delete("/api/issues/test")
                .send({
                    _id: issueTest._id
                })
                .end(function(err, res) {
                    assert.equal(res.status, 200)
                    assert.equal(res.body.result, 'successfully deleted');
                    done()
                })
        });
        test("Delete an issue with an invalid _id", (done) => {
            chai
                .request(server)
                .delete("/api/issues/test")
                .send({
                    _id: "123"
                })
                .end(function(err, res) {
                    assert.equal(res.status, 200)
                    assert.equal(res.body.error, 'could not delete');
                    done()
                })
        });
        test("Delete an issue with missing _id", (done) => {
            chai
                .request(server)
                .delete("/api/issues/test")
                .send({})
                .end(function(err, res) {
                    assert.equal(res.status, 200)
                    assert.equal(res.body.error, 'missing _id');
                    done()
                })
        });
    })
});

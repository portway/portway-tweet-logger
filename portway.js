const axios = require('axios')

// Exports

const getProject = async (id, key) => {
  const url = getProjectUrl(id);
  const res = await sendAuthorizedRequest(url, key);
  return res.data.data;
};

const getProjectDocuments = async (id, key) => {
  const url = getProjectDocumentsUrl(id);
  const res = await sendAuthorizedRequest(url, key);
  return res.data.data;
};

const getDocumentWithFields = async (id, key) => {
  const url = getDocWithFieldsUrl(id);
  const res = await sendAuthorizedRequest(url, key);
  return res.data.data;
};

const addField = async (docId, body, key) => {
  const url = getFieldCreateUrl(docId)
  const res = await sendAuthorizedRequest(url, key, 'post', body)
}

const publishDocument = async (docId, key) => {
  const url = getDocPublishUrl(docId)
  const res = await sendAuthorizedRequest(url, key, 'post', {})
}

// Helpers

const sendAuthorizedRequest = async (url, key, method = 'get', body) => {
  const req = {
    method,
    url,
    headers: {
      Authorization: `Bearer ${key}`
    }
  }
  if (method === 'post') {
    req.data = body
  }
  return axios(req);
};

const getProjectUrl = id => {
  return `https://api.portway.app/api/v1/projects/${id}`;
};

const getProjectDocumentsUrl = id => {
  return `https://api.portway.app/api/v1/projects/${id}/documents`;
};

const getDocWithFieldsUrl = id => {
  return `https://api.portway.app/api/v1/documents/${id}`;
};

const getFieldCreateUrl = id => {
  return `https://api.portway.app/api/v1/documents/${id}/fields`
}

const getDocPublishUrl = id => {
  return `https://api.portway.app/api/v1/documents/${id}/publish`;
}


exports.getProject = getProject
exports.getProjectDocuments = getProjectDocuments
exports.getDocumentWithFields = getDocumentWithFields
exports.addField = addField
exports.publishDocument = publishDocument
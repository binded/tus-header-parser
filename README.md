# tus-header-parser

[![Build Status](https://travis-ci.org/blockai/tus-header-parser.svg?branch=master)](https://travis-ci.org/blockai/tus-header-parser)

Express middleware that parses [Tus
headers](http://tus.io/protocols/resumable-upload.html#headers) and sets
them on `req.tus`.

- Ignores syntactically invalid headers
- Object keys are header names which have been converted to camelCase

**Parsed headers:**

Tus-Resumable, Upload-Offset, Upload-Length, Upload-Metadata,
Upload-Defer-Length, Upload-Checksum, Upload-Concat

## Install

```bash
npm install --save tus-header-parser
```

Requires Node v6+

## Usage

See [./test](./test) directory for usage examples.

```javascript
import tusParser from 'tus-header-parser'
// ...
app.use(tusParser())
app.use((req, res, next) => {
  console.log(req.headers)
  // {
  //   'tus-resumable': '1.0.0',
  //   'upload-offset': '1000',
  //   'upload-defer-length': '1',
  //   'upload-length': '1337',
  //   'upload-metadata': 'filename d29ybGRfZG9taW5hdGlvbl9wbGFuLnBkZg==,foo YmFy',
  //   'upload-checksum': 'sha Kq5sNclPz7QV2+lfQIuc6R7oRu0=',
  //   'upload-concat': 'final;/files/a /files/b',
  // }
  console.log(req.tus)
  // {
  //   tusResumable: '1.0.0',
  //   uploadOffset: 1000,
  //   uploadDeferLength: 1,
  //   uploadLength: 1337,
  //   uploadMetadata: {
  //     filename: 'world_domination_plan.pdf',
  //     foo: 'bar',
  //   },
  //   uploadChecksum: {
  //     algorithm: 'sha',
  //     checksum: <Buffer 2a ae 6c 35 c9 4f cf b4 15 db e9 5f 40 8b 9c e9 1e e8 46 ed>,
  //   },
  //   uploadConcat: {
  //     final: true,
  //     urls: ['/files/a', '/files/b'],
  //   },
  // }
})
```
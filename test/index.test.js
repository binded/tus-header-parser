import test from 'blue-tape'
import initTusParser, { parseHeader } from '../src'

const testData = {
  'Tus-Resumable': {
    valid: [
      '1.0.0',
    ],
    invalid: [],
  },
  'Upload-Offset': {
    valid: [
      ['0', 0],
      ['1', 1],
      ['1000', 1000],
    ],
    invalid: [
      '-1',
      'a',
      'bcd',
      '01',
      '0.2',
      '-1.2',
    ],
  },
  'Upload-Defer-Length': {
    valid: [
      ['1', 1],
    ],
    invalid: ['', '0', '-1', '01', 'a', 'abc', '1.0'],
  },
  'Upload-Length': {
    valid: [
      ['0', 0],
      ['1', 1],
      ['1000', 1000],
    ],
    invalid: [
      '01',
      '-1',
      'a',
      'bcd',
      '0.2',
      '-1.2',
    ],
  },
  'Upload-Metadata': {
    valid: [
      [
        'filename d29ybGRfZG9taW5hdGlvbl9wbGFuLnBkZg==',
        { filename: 'world_domination_plan.pdf' },
      ],
      [
        'filename d29ybGRfZG9taW5hdGlvbl9wbGFuLnBkZg==,foo YmFy',
        { filename: 'world_domination_plan.pdf', foo: 'bar' },
      ],
      [
        '',
        {},
      ],
      [
        'filename d29ybGRfZG9taW5hdGlvbl9wbGFuLnBkZg==, foo YmFy',
        { filename: 'world_domination_plan.pdf' },
      ],
      [
        'filename d29ybGRfZG9taW5hdGlvbl9wbGFuLnBkZg== foo, YmFy',
        {},
      ],
      [
        'filename',
        {},
      ],
      [
        'file name woot',
        {},
      ],
    ],
    invalid: [],
  },
  'Upload-Checksum': {
    valid: [
      [
        'sha Kq5sNclPz7QV2+lfQIuc6R7oRu0=',
        {
          algorithm: 'sha',
          checksum: Buffer.from('Kq5sNclPz7QV2+lfQIuc6R7oRu0=', 'base64'),
        },
      ],
      [
        'sha, Kq5sNclPz7QV2+lfQIuc6R7oRu0=',
        {
          algorithm: 'sha,',
          checksum: Buffer.from('Kq5sNclPz7QV2+lfQIuc6R7oRu0=', 'base64'),
        },
      ],
    ],
    invalid: [
      'sha ',
      'sha  Kq5sNclPz7QV2+lfQIuc6R7oRu0=',
      ' sha Kq5sNclPz7QV2+lfQIuc6R7oRu0=',
      '  Kq5sNclPz7QV2+lfQIuc6R7oRu0=',
    ],
  },
  'Upload-Concat': {
    valid: [
      ['partial', { partial: true }],
      ['final;/files/a /files/b', { final: true, urls: ['/files/a', '/files/b'] }],
    ],
    invalid: [
      'nonfinal',
      'final',
      'final; /files/a /files/b',
      'final; ',
    ],
  },
}

Object.keys(testData).forEach((headerName) => {
  const { valid, invalid } = testData[headerName]
  valid
    .map(v => (Array.isArray(v) ? v : [v, v]))
    .forEach(([strVal, expectedVal]) => {
      test(`${headerName} value ${strVal} is valid`, (t) => {
        t.deepEqual(parseHeader(headerName, strVal), expectedVal)
        t.end()
      })
    })
  invalid.forEach(strVal => {
    test(`${headerName} value ${strVal} is invalid`, (t) => {
      t.equal(typeof parseHeader(headerName, strVal), 'undefined')
      t.end()
    })
  })
})

test('initTusParser', (t) => {
  const parser = initTusParser()
  t.equal(typeof parser, 'function')
  const req = {
    headers: {
      'tus-resumable': '1.0.0',
      'upload-offset': '1000',
      'upload-defer-length': '1',
      'upload-length': '1337',
      'upload-metadata': 'filename d29ybGRfZG9taW5hdGlvbl9wbGFuLnBkZg==,foo YmFy',
      'upload-checksum': 'sha Kq5sNclPz7QV2+lfQIuc6R7oRu0=',
      'upload-concat': 'final;/files/a /files/b',
    },
  }
  const res = {}
  parser(req, res, () => {
    // console.log(req.tus.entries())
    t.deepEqual(Array.from(req.tus.entries()), [
      ['tusResumable', '1.0.0'],
      ['uploadOffset', 1000],
      ['uploadDeferLength', 1],
      ['uploadLength', 1337],
      ['uploadMetadata', { filename: 'world_domination_plan.pdf', foo: 'bar' }],
      [
        'uploadChecksum',
        { algorithm: 'sha', checksum: Buffer.from('Kq5sNclPz7QV2+lfQIuc6R7oRu0=', 'base64') },
      ],
      [
        'uploadConcat',
        { final: true, urls: ['/files/a', '/files/b'] },
      ],
    ])
    t.end()
  })
})

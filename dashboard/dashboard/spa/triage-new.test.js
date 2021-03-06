/* Copyright 2018 The Chromium Authors. All rights reserved.
   Use of this source code is governed by a BSD-style license that can be
   found in the LICENSE file.
*/
'use strict';

import {assert} from 'chai';
import TriageNew from './triage-new.js';

suite('triage-new', function() {
  test('summarize', async function() {
    assert.strictEqual('', TriageNew.summarize());
    assert.strictEqual('10% regression in aaa at 123', TriageNew.summarize([
      {
        percentDeltaValue: 0.1,
        startRevision: 123,
        endRevision: 123,
        measurement: 'aaa',
      },
    ]));
    const expected = '10%-20% regression in aaa,bbb at 123:234';
    assert.strictEqual(expected, TriageNew.summarize([
      {
        percentDeltaValue: 0.1,
        startRevision: 123,
        endRevision: 123,
        measurement: 'aaa',
      },
      {
        percentDeltaValue: 0.2,
        startRevision: 234,
        endRevision: 234,
        measurement: 'bbb',
      },
    ]));
  });

  test('collectAlertProperties', async function() {
    const expected = [
      {name: 'aaa', isEnabled: true},
      {name: 'bbb', isEnabled: true},
      {name: 'ccc', isEnabled: true},
      {name: 'Pri-2', isEnabled: true},
      {name: 'Type-Bug-Regression', isEnabled: true},
    ];
    const actual = TriageNew.collectAlertProperties([
      {bugLabels: ['aaa', 'bbb']},
      {bugLabels: ['aaa', 'ccc']},
    ], 'bugLabels');
    assert.deepEqual(expected, actual);
  });
});

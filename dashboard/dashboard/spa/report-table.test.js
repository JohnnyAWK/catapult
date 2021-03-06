/* Copyright 2018 The Chromium Authors. All rights reserved.
   Use of this source code is governed by a BSD-style license that can be
   found in the LICENSE file.
*/
'use strict';

import {assert} from 'chai';
import ReportTable from './report-table.js';
import {CHAIN, ENSURE, UPDATE} from './simple-redux.js';
import {afterRender} from './utils.js';

suite('report-table', function() {
  async function fixture() {
    const report = document.createElement('report-table');
    report.statePath = 'test';
    await report.dispatch(CHAIN(
        ENSURE('test'),
        UPDATE('test', ReportTable.buildState(options()))));
    document.body.appendChild(report);
    await afterRender();
    return report;
  }

  teardown(() => {
    for (const child of document.body.children) {
      if (!child.matches('report-table')) continue;
      document.body.removeChild(child);
    }
  });

  function options() {
    return {
      minRevision: 10,
      maxRevision: 100,
      rows: [
        {
          suite: {
            selectedOptions: ['suite'],
          },
          measurement: {
            selectedOptions: ['measure'],
          },
          bot: {
            selectedOptions: ['bot'],
          },
          case: {
            selectedOptions: ['case'],
          },
          actualDescriptors: [
            {
              testSuite: 'suite',
              bot: 'bot',
              testCase: 'case',
            },
          ],
          labelParts: [
            {isFirst: true, rowCount: 2, label: 'measure', href: '/'},
          ],
          scalars: [
            {unit: tr.b.Unit.byName.count, value: 2},
            {unit: tr.b.Unit.byName.count, value: 1},
            {unit: tr.b.Unit.byName.countDelta_smallerIsBetter, value: -1},
          ],
        },
      ],
    };
  }

  test('tooltip', async function() {
    const report = await fixture();
    const tr = report.$.table.querySelector('tbody').children[0];
    tr.dispatchEvent(new CustomEvent('mouseenter', {}));
    await afterRender();
    await afterRender();
    assert.deepEqual(report.tooltip.rows, [['suite', 'bot', 'case']]);
    const reportRect = report.getBoundingClientRect();
    assert.strictEqual(report.tooltip.top,
        tr.children[0].getBoundingClientRect().bottom - reportRect.top);
    assert.strictEqual(report.tooltip.left,
        tr.children[3].getBoundingClientRect().left - reportRect.left);

    const a = tr.children[0].children[0];
    let chartOptions;
    report.addEventListener('new-chart', e => {
      chartOptions = e.detail.options;
    });
    a.click();
    assert.deepEqual(chartOptions, {
      minRevision: 10,
      maxRevision: 100,
      parameters: {
        suites: ['suite'],
        measurements: ['measure'],
        bots: ['bot'],
        cases: ['case'],
      },
    });
  });

  test('copy', async function() {
    const report = await fixture();
    report.$.copy.click();
    assert.isTrue(report.$.copied.opened);
  });
});

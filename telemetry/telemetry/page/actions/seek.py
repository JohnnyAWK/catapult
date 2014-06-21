# Copyright 2013 The Chromium Authors. All rights reserved.
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.

"""A Telemetry page_action that performs the "seek" action on media elements.

Action attributes are:
- seek_time: The media time to seek to. Test fails if not provided.
- selector: If no selector is defined then the action attempts to seek the first
            media element on the page. If 'all' then seek all media elements.
- log_seek_time: If true the seek time is recorded, otherwise media measurement
                 will not be aware of the seek action. Used to perform multiple
                 seeks. Default true.
- wait_for_seeked: If true forces the action to wait for seeked event to fire.
                   Default false.
- wait_timeout_in_seconds: Timeout to wait for seeked event. Only valid with
                wait_for_seeked=true
- seek_label: A suffix string to name the seek perf measurement.
"""

from telemetry.core import exceptions
from telemetry.page.actions import media_action
from telemetry.page.actions import page_action


class SeekAction(media_action.MediaAction):
  def WillRunAction(self, tab):
    """Load the media metrics JS code prior to running the action."""
    super(SeekAction, self).WillRunAction(tab)
    self.LoadJS(tab, 'seek.js')

  def RunAction(self, tab):
    try:
      assert hasattr(self, 'seek_time')
      selector = self.selector if hasattr(self, 'selector') else ''
      log_seek = self.log_seek == True if hasattr(self, 'log_seek') else True
      seek_label = self.seek_label if hasattr(self, 'seek_label') else ''
      tab.ExecuteJavaScript('window.__seekMedia("%s", "%s", %i, "%s");' %
                            (selector, self.seek_time, log_seek, seek_label))
      timeout_in_seconds = (self.wait_timeout_in_seconds
                            if hasattr(self, 'wait_timeout_in_seconds') else 60)
      # Check if we need to wait for 'seeked' event to fire.
      if hasattr(self, 'wait_for_seeked') and self.wait_for_seeked:
        self.WaitForEvent(tab, selector, 'seeked', timeout_in_seconds)
    except exceptions.EvaluateException:
      raise page_action.PageActionFailed('Cannot seek media element(s) with '
                                         'selector = %s.' % selector)

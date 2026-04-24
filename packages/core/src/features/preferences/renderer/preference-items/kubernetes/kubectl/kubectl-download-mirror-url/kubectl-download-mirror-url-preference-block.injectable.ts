/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { preferenceItemInjectionToken } from "../../../preference-item-injection-token";
import { KubectlDownloadMirrorUrl } from "./kubectl-download-mirror-url";

const kubectlDownloadMirrorUrlPreferenceBlockInjectable = getInjectable({
  id: "kubectl-download-mirror-url-preference-item",

  instantiate: () => ({
    kind: "block" as const,
    id: "kubectl-download-mirror-url",
    parentId: "kubectl",
    orderNumber: 25,
    Component: KubectlDownloadMirrorUrl,
  }),

  injectionToken: preferenceItemInjectionToken,
});

export default kubectlDownloadMirrorUrlPreferenceBlockInjectable;

const deployedContracts = {
  31337: {
    loop: {
      address: "0x36d4475f3bacDA9f3A2cE98c0c025B16ab1faFd9",
      abi: [
        {
          type: "function",
          name: "DiamondCut_init",
          inputs: [
            {
              name: "_systemAdmin",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "diamondCut",
          inputs: [
            {
              name: "facetCuts",
              type: "tuple[]",
              internalType: "struct IDiamond.FacetCut[]",
              components: [
                {
                  name: "facet",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "action",
                  type: "uint8",
                  internalType: "enum IDiamond.FacetCutAction",
                },
                {
                  name: "selectors",
                  type: "bytes4[]",
                  internalType: "bytes4[]",
                },
              ],
            },
            {
              name: "init",
              type: "address",
              internalType: "address",
            },
            {
              name: "initData",
              type: "bytes",
              internalType: "bytes",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "setSystemAdmin",
          inputs: [
            {
              name: "_admin",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "event",
          name: "DiamondCut",
          inputs: [
            {
              name: "facetCuts",
              type: "tuple[]",
              indexed: false,
              internalType: "struct IDiamond.FacetCut[]",
              components: [
                {
                  name: "facet",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "action",
                  type: "uint8",
                  internalType: "enum IDiamond.FacetCutAction",
                },
                {
                  name: "selectors",
                  type: "bytes4[]",
                  internalType: "bytes4[]",
                },
              ],
            },
            {
              name: "init",
              type: "address",
              indexed: false,
              internalType: "address",
            },
            {
              name: "initData",
              type: "bytes",
              indexed: false,
              internalType: "bytes",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "Initialized",
          inputs: [
            {
              name: "version",
              type: "uint64",
              indexed: false,
              internalType: "uint64",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "SystemAdminUpdated",
          inputs: [
            {
              name: "admin",
              type: "address",
              indexed: false,
              internalType: "address",
            },
          ],
          anonymous: false,
        },
        {
          type: "error",
          name: "AddressEmptyCode",
          inputs: [
            {
              name: "target",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "CallerIsNotAuthorized",
          inputs: [],
        },
        {
          type: "error",
          name: "CallerIsNotOwner",
          inputs: [],
        },
        {
          type: "error",
          name: "CallerIsNotSystemAdmin",
          inputs: [],
        },
        {
          type: "error",
          name: "DelegateNotAllowed",
          inputs: [],
        },
        {
          type: "error",
          name: "DiamondCut_CannotRemoveFromOtherFacet",
          inputs: [
            {
              name: "facet",
              type: "address",
              internalType: "address",
            },
            {
              name: "selector",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_FacetIsNotContract",
          inputs: [
            {
              name: "facet",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_FacetIsZeroAddress",
          inputs: [],
        },
        {
          type: "error",
          name: "DiamondCut_FunctionAlreadyExists",
          inputs: [
            {
              name: "selector",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_FunctionFromSameFacet",
          inputs: [
            {
              name: "selector",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_ImmutableFacet",
          inputs: [],
        },
        {
          type: "error",
          name: "DiamondCut_IncorrectFacetCutAction",
          inputs: [],
        },
        {
          type: "error",
          name: "DiamondCut_InitIsNotContract",
          inputs: [
            {
              name: "init",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_NonExistingFunction",
          inputs: [
            {
              name: "selector",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_SelectorArrayEmpty",
          inputs: [
            {
              name: "facet",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_SelectorIsZero",
          inputs: [],
        },
        {
          type: "error",
          name: "FailedCall",
          inputs: [],
        },
        {
          type: "error",
          name: "InvalidInitialization",
          inputs: [],
        },
        {
          type: "error",
          name: "NotInitializing",
          inputs: [],
        },
        {
          type: "error",
          name: "OnlyDelegate",
          inputs: [],
        },
        {
          type: "error",
          name: "ReentrancyGuardReentrantCall",
          inputs: [],
        },
        {
          type: "function",
          name: "DiamondLoupe_init",
          inputs: [],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "facetAddress",
          inputs: [
            {
              name: "selector",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "facetAddresses",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "address[]",
              internalType: "address[]",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "facetFunctionSelectors",
          inputs: [
            {
              name: "facet",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bytes4[]",
              internalType: "bytes4[]",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "facets",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "tuple[]",
              internalType: "struct IDiamondLoupeBase.Facet[]",
              components: [
                {
                  name: "facet",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "selectors",
                  type: "bytes4[]",
                  internalType: "bytes4[]",
                },
              ],
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "supportsInterface",
          inputs: [
            {
              name: "interfaceId",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bool",
              internalType: "bool",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "event",
          name: "Initialized",
          inputs: [
            {
              name: "version",
              type: "uint64",
              indexed: false,
              internalType: "uint64",
            },
          ],
          anonymous: false,
        },
        {
          type: "error",
          name: "CallerIsNotAuthorized",
          inputs: [],
        },
        {
          type: "error",
          name: "CallerIsNotOwner",
          inputs: [],
        },
        {
          type: "error",
          name: "DelegateNotAllowed",
          inputs: [],
        },
        {
          type: "error",
          name: "InvalidInitialization",
          inputs: [],
        },
        {
          type: "error",
          name: "NotInitializing",
          inputs: [],
        },
        {
          type: "error",
          name: "OnlyDelegate",
          inputs: [],
        },
        {
          type: "error",
          name: "ReentrancyGuardReentrantCall",
          inputs: [],
        },
        {
          type: "function",
          name: "LOOP_ADMIN_ROLE",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "bytes32",
              internalType: "bytes32",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "Loop_init",
          inputs: [
            {
              name: "_token",
              type: "address",
              internalType: "contract ERC20",
            },
            {
              name: "_loopAdmin",
              type: "address",
              internalType: "address",
            },
            {
              name: "_periodLength",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_percentPerPeriod",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_trustedBackendSigner",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "ONE_HUNDRED_PERCENT",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "claim",
          inputs: [],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "claimAndRegister",
          inputs: [
            {
              name: "signature",
              type: "bytes",
              internalType: "bytes",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "getCurrentPeriod",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getCurrentPeriodData",
          inputs: [],
          outputs: [
            {
              name: "totalRegisteredUsers",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "maxPayout",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getLoopDetails",
          inputs: [],
          outputs: [
            {
              name: "token",
              type: "address",
              internalType: "address",
            },
            {
              name: "periodLength",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "percentPerPeriod",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "firstPeriodStart",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getPeriodIndividualPayout",
          inputs: [
            {
              name: "_periodNumber",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "setPercentPerPeriod",
          inputs: [
            {
              name: "_percentPerPeriod",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "setTrustedBackendSigner",
          inputs: [
            {
              name: "_newSigner",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "withdrawDeposit",
          inputs: [
            {
              name: "_to",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "event",
          name: "Claim",
          inputs: [
            {
              name: "claimer",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "periodNumber",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
            {
              name: "payout",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "FunctionAccessChanged",
          inputs: [
            {
              name: "functionSig",
              type: "bytes4",
              indexed: true,
              internalType: "bytes4",
            },
            {
              name: "role",
              type: "uint8",
              indexed: true,
              internalType: "uint8",
            },
            {
              name: "enabled",
              type: "bool",
              indexed: false,
              internalType: "bool",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "Initialize",
          inputs: [
            {
              name: "token",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "periodLength",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
            {
              name: "percentPerPeriod",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "Register",
          inputs: [
            {
              name: "sender",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "periodNumber",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "SetPercentPerPeriod",
          inputs: [
            {
              name: "percentPerPeriod",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "TrustedBackendSignerUpdated",
          inputs: [
            {
              name: "newSigner",
              type: "address",
              indexed: true,
              internalType: "address",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "UserRoleUpdated",
          inputs: [
            {
              name: "user",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "role",
              type: "uint8",
              indexed: true,
              internalType: "uint8",
            },
            {
              name: "enabled",
              type: "bool",
              indexed: false,
              internalType: "bool",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "Withdraw",
          inputs: [
            {
              name: "admin",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "to",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "amount",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "error",
          name: "AccessControl_CallerIsNotAuthorized",
          inputs: [],
        },
        {
          type: "error",
          name: "AccessControl_CannotRemoveAdmin",
          inputs: [],
        },
        {
          type: "error",
          name: "AlreadyRegistered",
          inputs: [],
        },
        {
          type: "error",
          name: "CannotClaim",
          inputs: [],
        },
        {
          type: "error",
          name: "ECDSAInvalidSignature",
          inputs: [],
        },
        {
          type: "error",
          name: "ECDSAInvalidSignatureLength",
          inputs: [
            {
              name: "length",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
        {
          type: "error",
          name: "ECDSAInvalidSignatureS",
          inputs: [
            {
              name: "s",
              type: "bytes32",
              internalType: "bytes32",
            },
          ],
        },
        {
          type: "error",
          name: "FaucetBalanceIsZero",
          inputs: [],
        },
        {
          type: "error",
          name: "InvalidPeriodLength",
          inputs: [],
        },
        {
          type: "error",
          name: "InvalidPeriodPercentage",
          inputs: [],
        },
        {
          type: "error",
          name: "NotAuthorized",
          inputs: [],
        },
      ],
    },
    organization: {
      address: "0x4fBd2B1681897666FCc9E953839f3F49cA16bf20",
      abi: [
        {
          type: "function",
          name: "DiamondCut_init",
          inputs: [
            {
              name: "_systemAdmin",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "diamondCut",
          inputs: [
            {
              name: "facetCuts",
              type: "tuple[]",
              internalType: "struct IDiamond.FacetCut[]",
              components: [
                {
                  name: "facet",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "action",
                  type: "uint8",
                  internalType: "enum IDiamond.FacetCutAction",
                },
                {
                  name: "selectors",
                  type: "bytes4[]",
                  internalType: "bytes4[]",
                },
              ],
            },
            {
              name: "init",
              type: "address",
              internalType: "address",
            },
            {
              name: "initData",
              type: "bytes",
              internalType: "bytes",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "setSystemAdmin",
          inputs: [
            {
              name: "_admin",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "event",
          name: "DiamondCut",
          inputs: [
            {
              name: "facetCuts",
              type: "tuple[]",
              indexed: false,
              internalType: "struct IDiamond.FacetCut[]",
              components: [
                {
                  name: "facet",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "action",
                  type: "uint8",
                  internalType: "enum IDiamond.FacetCutAction",
                },
                {
                  name: "selectors",
                  type: "bytes4[]",
                  internalType: "bytes4[]",
                },
              ],
            },
            {
              name: "init",
              type: "address",
              indexed: false,
              internalType: "address",
            },
            {
              name: "initData",
              type: "bytes",
              indexed: false,
              internalType: "bytes",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "Initialized",
          inputs: [
            {
              name: "version",
              type: "uint64",
              indexed: false,
              internalType: "uint64",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "SystemAdminUpdated",
          inputs: [
            {
              name: "admin",
              type: "address",
              indexed: false,
              internalType: "address",
            },
          ],
          anonymous: false,
        },
        {
          type: "error",
          name: "AddressEmptyCode",
          inputs: [
            {
              name: "target",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "CallerIsNotAuthorized",
          inputs: [],
        },
        {
          type: "error",
          name: "CallerIsNotOwner",
          inputs: [],
        },
        {
          type: "error",
          name: "CallerIsNotSystemAdmin",
          inputs: [],
        },
        {
          type: "error",
          name: "DelegateNotAllowed",
          inputs: [],
        },
        {
          type: "error",
          name: "DiamondCut_CannotRemoveFromOtherFacet",
          inputs: [
            {
              name: "facet",
              type: "address",
              internalType: "address",
            },
            {
              name: "selector",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_FacetIsNotContract",
          inputs: [
            {
              name: "facet",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_FacetIsZeroAddress",
          inputs: [],
        },
        {
          type: "error",
          name: "DiamondCut_FunctionAlreadyExists",
          inputs: [
            {
              name: "selector",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_FunctionFromSameFacet",
          inputs: [
            {
              name: "selector",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_ImmutableFacet",
          inputs: [],
        },
        {
          type: "error",
          name: "DiamondCut_IncorrectFacetCutAction",
          inputs: [],
        },
        {
          type: "error",
          name: "DiamondCut_InitIsNotContract",
          inputs: [
            {
              name: "init",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_NonExistingFunction",
          inputs: [
            {
              name: "selector",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_SelectorArrayEmpty",
          inputs: [
            {
              name: "facet",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_SelectorIsZero",
          inputs: [],
        },
        {
          type: "error",
          name: "FailedCall",
          inputs: [],
        },
        {
          type: "error",
          name: "InvalidInitialization",
          inputs: [],
        },
        {
          type: "error",
          name: "NotInitializing",
          inputs: [],
        },
        {
          type: "error",
          name: "OnlyDelegate",
          inputs: [],
        },
        {
          type: "error",
          name: "ReentrancyGuardReentrantCall",
          inputs: [],
        },
        {
          type: "function",
          name: "DiamondLoupe_init",
          inputs: [],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "facetAddress",
          inputs: [
            {
              name: "selector",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "facetAddresses",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "address[]",
              internalType: "address[]",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "facetFunctionSelectors",
          inputs: [
            {
              name: "facet",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bytes4[]",
              internalType: "bytes4[]",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "facets",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "tuple[]",
              internalType: "struct IDiamondLoupeBase.Facet[]",
              components: [
                {
                  name: "facet",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "selectors",
                  type: "bytes4[]",
                  internalType: "bytes4[]",
                },
              ],
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "supportsInterface",
          inputs: [
            {
              name: "interfaceId",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bool",
              internalType: "bool",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "event",
          name: "Initialized",
          inputs: [
            {
              name: "version",
              type: "uint64",
              indexed: false,
              internalType: "uint64",
            },
          ],
          anonymous: false,
        },
        {
          type: "error",
          name: "CallerIsNotAuthorized",
          inputs: [],
        },
        {
          type: "error",
          name: "CallerIsNotOwner",
          inputs: [],
        },
        {
          type: "error",
          name: "DelegateNotAllowed",
          inputs: [],
        },
        {
          type: "error",
          name: "InvalidInitialization",
          inputs: [],
        },
        {
          type: "error",
          name: "NotInitializing",
          inputs: [],
        },
        {
          type: "error",
          name: "OnlyDelegate",
          inputs: [],
        },
        {
          type: "error",
          name: "ReentrancyGuardReentrantCall",
          inputs: [],
        },
        {
          type: "function",
          name: "Organization_init",
          inputs: [
            {
              name: "_name",
              type: "string",
              internalType: "string",
            },
            {
              name: "_admin",
              type: "address",
              internalType: "address",
            },
            {
              name: "_description",
              type: "string",
              internalType: "string",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "addAdmin",
          inputs: [
            {
              name: "newAdmin",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "createNewLoop",
          inputs: [
            {
              name: "systemDiamond",
              type: "address",
              internalType: "address",
            },
            {
              name: "token",
              type: "address",
              internalType: "address",
            },
            {
              name: "periodLength",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "percentPerPeriod",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "newLoop",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "getOrganizationAdmin",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getOrganizationDescription",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "string",
              internalType: "string",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getOrganizationName",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "string",
              internalType: "string",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "removeAdmin",
          inputs: [
            {
              name: "adminToRemove",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "event",
          name: "FunctionAccessChanged",
          inputs: [
            {
              name: "functionSig",
              type: "bytes4",
              indexed: true,
              internalType: "bytes4",
            },
            {
              name: "role",
              type: "uint8",
              indexed: true,
              internalType: "uint8",
            },
            {
              name: "enabled",
              type: "bool",
              indexed: false,
              internalType: "bool",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "Initialized",
          inputs: [
            {
              name: "version",
              type: "uint64",
              indexed: false,
              internalType: "uint64",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "LoopCreated",
          inputs: [
            {
              name: "loopAddress",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "token",
              type: "address",
              indexed: false,
              internalType: "address",
            },
            {
              name: "periodLength",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
            {
              name: "percentPerPeriod",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "UserRoleUpdated",
          inputs: [
            {
              name: "user",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "role",
              type: "uint8",
              indexed: true,
              internalType: "uint8",
            },
            {
              name: "enabled",
              type: "bool",
              indexed: false,
              internalType: "bool",
            },
          ],
          anonymous: false,
        },
        {
          type: "error",
          name: "AccessControl_CallerIsNotAuthorized",
          inputs: [],
        },
        {
          type: "error",
          name: "AccessControl_CannotRemoveAdmin",
          inputs: [],
        },
        {
          type: "error",
          name: "CallerIsNotAuthorized",
          inputs: [],
        },
        {
          type: "error",
          name: "CallerIsNotOwner",
          inputs: [],
        },
        {
          type: "error",
          name: "DelegateNotAllowed",
          inputs: [],
        },
        {
          type: "error",
          name: "InvalidInitialization",
          inputs: [],
        },
        {
          type: "error",
          name: "NotInitializing",
          inputs: [],
        },
        {
          type: "error",
          name: "OnlyDelegate",
          inputs: [],
        },
        {
          type: "error",
          name: "ReentrancyGuardReentrantCall",
          inputs: [],
        },
      ],
    },
    system_diamond: {
      address: "0xb17646006b3057714eafF5329b8e95F654B03Ba4",
      abi: [
        {
          type: "function",
          name: "AccessControl_init",
          inputs: [
            {
              name: "roleAdmin",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "canCall",
          inputs: [
            {
              name: "user",
              type: "address",
              internalType: "address",
            },
            {
              name: "functionSig",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bool",
              internalType: "bool",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "functionRoles",
          inputs: [
            {
              name: "functionSig",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bytes32",
              internalType: "bytes32",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "hasRole",
          inputs: [
            {
              name: "user",
              type: "address",
              internalType: "address",
            },
            {
              name: "role",
              type: "uint8",
              internalType: "uint8",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bool",
              internalType: "bool",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "roleHasAccess",
          inputs: [
            {
              name: "role",
              type: "uint8",
              internalType: "uint8",
            },
            {
              name: "functionSig",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bool",
              internalType: "bool",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "setFunctionAccess",
          inputs: [
            {
              name: "functionSig",
              type: "bytes4",
              internalType: "bytes4",
            },
            {
              name: "role",
              type: "uint8",
              internalType: "uint8",
            },
            {
              name: "enabled",
              type: "bool",
              internalType: "bool",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "setUserRole",
          inputs: [
            {
              name: "user",
              type: "address",
              internalType: "address",
            },
            {
              name: "role",
              type: "uint8",
              internalType: "uint8",
            },
            {
              name: "enabled",
              type: "bool",
              internalType: "bool",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "userRoles",
          inputs: [
            {
              name: "user",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bytes32",
              internalType: "bytes32",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "event",
          name: "FunctionAccessChanged",
          inputs: [
            {
              name: "functionSig",
              type: "bytes4",
              indexed: true,
              internalType: "bytes4",
            },
            {
              name: "role",
              type: "uint8",
              indexed: true,
              internalType: "uint8",
            },
            {
              name: "enabled",
              type: "bool",
              indexed: false,
              internalType: "bool",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "Initialized",
          inputs: [
            {
              name: "version",
              type: "uint64",
              indexed: false,
              internalType: "uint64",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "UserRoleUpdated",
          inputs: [
            {
              name: "user",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "role",
              type: "uint8",
              indexed: true,
              internalType: "uint8",
            },
            {
              name: "enabled",
              type: "bool",
              indexed: false,
              internalType: "bool",
            },
          ],
          anonymous: false,
        },
        {
          type: "error",
          name: "AccessControl_CallerIsNotAuthorized",
          inputs: [],
        },
        {
          type: "error",
          name: "AccessControl_CannotRemoveAdmin",
          inputs: [],
        },
        {
          type: "error",
          name: "CallerIsNotAuthorized",
          inputs: [],
        },
        {
          type: "error",
          name: "CallerIsNotOwner",
          inputs: [],
        },
        {
          type: "error",
          name: "DelegateNotAllowed",
          inputs: [],
        },
        {
          type: "error",
          name: "InvalidInitialization",
          inputs: [],
        },
        {
          type: "error",
          name: "NotInitializing",
          inputs: [],
        },
        {
          type: "error",
          name: "OnlyDelegate",
          inputs: [],
        },
        {
          type: "error",
          name: "ReentrancyGuardReentrantCall",
          inputs: [],
        },
        {
          type: "function",
          name: "DiamondCut_init",
          inputs: [
            {
              name: "_systemAdmin",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "diamondCut",
          inputs: [
            {
              name: "facetCuts",
              type: "tuple[]",
              internalType: "struct IDiamond.FacetCut[]",
              components: [
                {
                  name: "facet",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "action",
                  type: "uint8",
                  internalType: "enum IDiamond.FacetCutAction",
                },
                {
                  name: "selectors",
                  type: "bytes4[]",
                  internalType: "bytes4[]",
                },
              ],
            },
            {
              name: "init",
              type: "address",
              internalType: "address",
            },
            {
              name: "initData",
              type: "bytes",
              internalType: "bytes",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "setSystemAdmin",
          inputs: [
            {
              name: "_admin",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "event",
          name: "DiamondCut",
          inputs: [
            {
              name: "facetCuts",
              type: "tuple[]",
              indexed: false,
              internalType: "struct IDiamond.FacetCut[]",
              components: [
                {
                  name: "facet",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "action",
                  type: "uint8",
                  internalType: "enum IDiamond.FacetCutAction",
                },
                {
                  name: "selectors",
                  type: "bytes4[]",
                  internalType: "bytes4[]",
                },
              ],
            },
            {
              name: "init",
              type: "address",
              indexed: false,
              internalType: "address",
            },
            {
              name: "initData",
              type: "bytes",
              indexed: false,
              internalType: "bytes",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "Initialized",
          inputs: [
            {
              name: "version",
              type: "uint64",
              indexed: false,
              internalType: "uint64",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "SystemAdminUpdated",
          inputs: [
            {
              name: "admin",
              type: "address",
              indexed: false,
              internalType: "address",
            },
          ],
          anonymous: false,
        },
        {
          type: "error",
          name: "AddressEmptyCode",
          inputs: [
            {
              name: "target",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "CallerIsNotAuthorized",
          inputs: [],
        },
        {
          type: "error",
          name: "CallerIsNotOwner",
          inputs: [],
        },
        {
          type: "error",
          name: "CallerIsNotSystemAdmin",
          inputs: [],
        },
        {
          type: "error",
          name: "DelegateNotAllowed",
          inputs: [],
        },
        {
          type: "error",
          name: "DiamondCut_CannotRemoveFromOtherFacet",
          inputs: [
            {
              name: "facet",
              type: "address",
              internalType: "address",
            },
            {
              name: "selector",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_FacetIsNotContract",
          inputs: [
            {
              name: "facet",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_FacetIsZeroAddress",
          inputs: [],
        },
        {
          type: "error",
          name: "DiamondCut_FunctionAlreadyExists",
          inputs: [
            {
              name: "selector",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_FunctionFromSameFacet",
          inputs: [
            {
              name: "selector",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_ImmutableFacet",
          inputs: [],
        },
        {
          type: "error",
          name: "DiamondCut_IncorrectFacetCutAction",
          inputs: [],
        },
        {
          type: "error",
          name: "DiamondCut_InitIsNotContract",
          inputs: [
            {
              name: "init",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_NonExistingFunction",
          inputs: [
            {
              name: "selector",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_SelectorArrayEmpty",
          inputs: [
            {
              name: "facet",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_SelectorIsZero",
          inputs: [],
        },
        {
          type: "error",
          name: "FailedCall",
          inputs: [],
        },
        {
          type: "error",
          name: "InvalidInitialization",
          inputs: [],
        },
        {
          type: "error",
          name: "NotInitializing",
          inputs: [],
        },
        {
          type: "error",
          name: "OnlyDelegate",
          inputs: [],
        },
        {
          type: "error",
          name: "ReentrancyGuardReentrantCall",
          inputs: [],
        },
        {
          type: "function",
          name: "DiamondLoupe_init",
          inputs: [],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "facetAddress",
          inputs: [
            {
              name: "selector",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "facetAddresses",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "address[]",
              internalType: "address[]",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "facetFunctionSelectors",
          inputs: [
            {
              name: "facet",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bytes4[]",
              internalType: "bytes4[]",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "facets",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "tuple[]",
              internalType: "struct IDiamondLoupeBase.Facet[]",
              components: [
                {
                  name: "facet",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "selectors",
                  type: "bytes4[]",
                  internalType: "bytes4[]",
                },
              ],
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "supportsInterface",
          inputs: [
            {
              name: "interfaceId",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bool",
              internalType: "bool",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "event",
          name: "Initialized",
          inputs: [
            {
              name: "version",
              type: "uint64",
              indexed: false,
              internalType: "uint64",
            },
          ],
          anonymous: false,
        },
        {
          type: "error",
          name: "CallerIsNotAuthorized",
          inputs: [],
        },
        {
          type: "error",
          name: "CallerIsNotOwner",
          inputs: [],
        },
        {
          type: "error",
          name: "DelegateNotAllowed",
          inputs: [],
        },
        {
          type: "error",
          name: "InvalidInitialization",
          inputs: [],
        },
        {
          type: "error",
          name: "NotInitializing",
          inputs: [],
        },
        {
          type: "error",
          name: "OnlyDelegate",
          inputs: [],
        },
        {
          type: "error",
          name: "ReentrancyGuardReentrantCall",
          inputs: [],
        },
        {
          type: "function",
          name: "LoopFactory_init",
          inputs: [
            {
              name: "diamondFactory",
              type: "address",
              internalType: "address",
            },
            {
              name: "facetRegistry",
              type: "address",
              internalType: "address",
            },
            {
              name: "_trustedBackendSigner",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "createLoop",
          inputs: [
            {
              name: "organization",
              type: "address",
              internalType: "address",
            },
            {
              name: "token",
              type: "address",
              internalType: "address",
            },
            {
              name: "admin",
              type: "address",
              internalType: "address",
            },
            {
              name: "periodLength",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "percentPerPeriod",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "newLoop",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "getLoopsByOrganization",
          inputs: [
            {
              name: "organization",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "",
              type: "address[]",
              internalType: "address[]",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "setTrustedBackendSigner",
          inputs: [
            {
              name: "_newSigner",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "event",
          name: "FunctionAccessChanged",
          inputs: [
            {
              name: "functionSig",
              type: "bytes4",
              indexed: true,
              internalType: "bytes4",
            },
            {
              name: "role",
              type: "uint8",
              indexed: true,
              internalType: "uint8",
            },
            {
              name: "enabled",
              type: "bool",
              indexed: false,
              internalType: "bool",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "Initialized",
          inputs: [
            {
              name: "version",
              type: "uint64",
              indexed: false,
              internalType: "uint64",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "LoopCreated",
          inputs: [
            {
              name: "loopId",
              type: "uint256",
              indexed: true,
              internalType: "uint256",
            },
            {
              name: "loopAddress",
              type: "address",
              indexed: false,
              internalType: "address",
            },
            {
              name: "organization",
              type: "address",
              indexed: false,
              internalType: "address",
            },
            {
              name: "token",
              type: "address",
              indexed: false,
              internalType: "address",
            },
            {
              name: "periodLength",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
            {
              name: "percentPerPeriod",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "TrustedBackendSignerUpdated",
          inputs: [
            {
              name: "newSigner",
              type: "address",
              indexed: true,
              internalType: "address",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "UserRoleUpdated",
          inputs: [
            {
              name: "user",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "role",
              type: "uint8",
              indexed: true,
              internalType: "uint8",
            },
            {
              name: "enabled",
              type: "bool",
              indexed: false,
              internalType: "bool",
            },
          ],
          anonymous: false,
        },
        {
          type: "error",
          name: "AccessControl_CallerIsNotAuthorized",
          inputs: [],
        },
        {
          type: "error",
          name: "AccessControl_CannotRemoveAdmin",
          inputs: [],
        },
        {
          type: "error",
          name: "CallerIsNotAuthorized",
          inputs: [],
        },
        {
          type: "error",
          name: "CallerIsNotOwner",
          inputs: [],
        },
        {
          type: "error",
          name: "DelegateNotAllowed",
          inputs: [],
        },
        {
          type: "error",
          name: "InvalidInitialization",
          inputs: [],
        },
        {
          type: "error",
          name: "NotInitializing",
          inputs: [],
        },
        {
          type: "error",
          name: "OnlyDelegate",
          inputs: [],
        },
        {
          type: "error",
          name: "ReentrancyGuardReentrantCall",
          inputs: [],
        },
        {
          type: "function",
          name: "ADMIN_ROLE",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "bytes32",
              internalType: "bytes32",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "OrganizationFactory_init",
          inputs: [
            {
              name: "diamondFactory",
              type: "address",
              internalType: "address",
            },
            {
              name: "facetRegistry",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "createOrganization",
          inputs: [
            {
              name: "name",
              type: "string",
              internalType: "string",
            },
            {
              name: "admin",
              type: "address",
              internalType: "address",
            },
            {
              name: "description",
              type: "string",
              internalType: "string",
            },
          ],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "getOrganizationById",
          inputs: [
            {
              name: "id",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getOrganizationCount",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "event",
          name: "FunctionAccessChanged",
          inputs: [
            {
              name: "functionSig",
              type: "bytes4",
              indexed: true,
              internalType: "bytes4",
            },
            {
              name: "role",
              type: "uint8",
              indexed: true,
              internalType: "uint8",
            },
            {
              name: "enabled",
              type: "bool",
              indexed: false,
              internalType: "bool",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "Initialized",
          inputs: [
            {
              name: "version",
              type: "uint64",
              indexed: false,
              internalType: "uint64",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "OrganizationCreated",
          inputs: [
            {
              name: "id",
              type: "uint256",
              indexed: true,
              internalType: "uint256",
            },
            {
              name: "organizationAddress",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "name",
              type: "string",
              indexed: false,
              internalType: "string",
            },
            {
              name: "admin",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "description",
              type: "string",
              indexed: false,
              internalType: "string",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "UserRoleUpdated",
          inputs: [
            {
              name: "user",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "role",
              type: "uint8",
              indexed: true,
              internalType: "uint8",
            },
            {
              name: "enabled",
              type: "bool",
              indexed: false,
              internalType: "bool",
            },
          ],
          anonymous: false,
        },
        {
          type: "error",
          name: "AccessControl_CallerIsNotAuthorized",
          inputs: [],
        },
        {
          type: "error",
          name: "AccessControl_CannotRemoveAdmin",
          inputs: [],
        },
        {
          type: "error",
          name: "CallerIsNotAuthorized",
          inputs: [],
        },
        {
          type: "error",
          name: "CallerIsNotOwner",
          inputs: [],
        },
        {
          type: "error",
          name: "DelegateNotAllowed",
          inputs: [],
        },
        {
          type: "error",
          name: "InvalidInitialization",
          inputs: [],
        },
        {
          type: "error",
          name: "NotInitializing",
          inputs: [],
        },
        {
          type: "error",
          name: "OnlyDelegate",
          inputs: [],
        },
        {
          type: "error",
          name: "ReentrancyGuardReentrantCall",
          inputs: [],
        },
      ],
    },
    test_token_address: {
      address: "0x7bc06c482DEAd17c0e297aFbC32f6e63d3846650",
      abi: [
        {
          type: "constructor",
          inputs: [
            {
              name: "name",
              type: "string",
              internalType: "string",
            },
            {
              name: "symbol",
              type: "string",
              internalType: "string",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "allowance",
          inputs: [
            {
              name: "owner",
              type: "address",
              internalType: "address",
            },
            {
              name: "spender",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "approve",
          inputs: [
            {
              name: "spender",
              type: "address",
              internalType: "address",
            },
            {
              name: "value",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bool",
              internalType: "bool",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "balanceOf",
          inputs: [
            {
              name: "account",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "decimals",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint8",
              internalType: "uint8",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "name",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "string",
              internalType: "string",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "symbol",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "string",
              internalType: "string",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "totalSupply",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "transfer",
          inputs: [
            {
              name: "to",
              type: "address",
              internalType: "address",
            },
            {
              name: "value",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bool",
              internalType: "bool",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "transferFrom",
          inputs: [
            {
              name: "from",
              type: "address",
              internalType: "address",
            },
            {
              name: "to",
              type: "address",
              internalType: "address",
            },
            {
              name: "value",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bool",
              internalType: "bool",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "event",
          name: "Approval",
          inputs: [
            {
              name: "owner",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "spender",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "value",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "Transfer",
          inputs: [
            {
              name: "from",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "to",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "value",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "error",
          name: "ERC20InsufficientAllowance",
          inputs: [
            {
              name: "spender",
              type: "address",
              internalType: "address",
            },
            {
              name: "allowance",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "needed",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
        {
          type: "error",
          name: "ERC20InsufficientBalance",
          inputs: [
            {
              name: "sender",
              type: "address",
              internalType: "address",
            },
            {
              name: "balance",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "needed",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
        {
          type: "error",
          name: "ERC20InvalidApprover",
          inputs: [
            {
              name: "approver",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "ERC20InvalidReceiver",
          inputs: [
            {
              name: "receiver",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "ERC20InvalidSender",
          inputs: [
            {
              name: "sender",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "ERC20InvalidSpender",
          inputs: [
            {
              name: "spender",
              type: "address",
              internalType: "address",
            },
          ],
        },
      ],
    },
    FacetRegistry: {
      address: "0x9d4454b023096f34b160d6b654540c56a1f81688",
      abi: [
        {
          type: "constructor",
          inputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "addFacet",
          inputs: [
            {
              name: "facet",
              type: "address",
              internalType: "address",
            },
            {
              name: "selectors",
              type: "bytes4[]",
              internalType: "bytes4[]",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "computeFacetAddress",
          inputs: [
            {
              name: "salt",
              type: "bytes32",
              internalType: "bytes32",
            },
            {
              name: "creationCode",
              type: "bytes",
              internalType: "bytes",
            },
          ],
          outputs: [
            {
              name: "facet",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "deployFacet",
          inputs: [
            {
              name: "salt",
              type: "bytes32",
              internalType: "bytes32",
            },
            {
              name: "creationCode",
              type: "bytes",
              internalType: "bytes",
            },
            {
              name: "selectors",
              type: "bytes4[]",
              internalType: "bytes4[]",
            },
          ],
          outputs: [
            {
              name: "facet",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "facetAddresses",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "address[]",
              internalType: "address[]",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "facetSelectors",
          inputs: [
            {
              name: "facet",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bytes4[]",
              internalType: "bytes4[]",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getFacetBySelector",
          inputs: [
            {
              name: "selector",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "owner",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "removeFacet",
          inputs: [
            {
              name: "facet",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "event",
          name: "FacetRegistered",
          inputs: [
            {
              name: "facet",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "selectors",
              type: "bytes4[]",
              indexed: false,
              internalType: "bytes4[]",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "FacetUnregistered",
          inputs: [
            {
              name: "facet",
              type: "address",
              indexed: true,
              internalType: "address",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "OwnerSet",
          inputs: [
            {
              name: "owner",
              type: "address",
              indexed: true,
              internalType: "address",
            },
          ],
          anonymous: false,
        },
        {
          type: "error",
          name: "Create2EmptyBytecode",
          inputs: [],
        },
        {
          type: "error",
          name: "FacetRegistry_FacetAddressZero",
          inputs: [],
        },
        {
          type: "error",
          name: "FacetRegistry_FacetAlreadyRegistered",
          inputs: [],
        },
        {
          type: "error",
          name: "FacetRegistry_FacetMustHaveSelectors",
          inputs: [],
        },
        {
          type: "error",
          name: "FacetRegistry_FacetNotContract",
          inputs: [],
        },
        {
          type: "error",
          name: "FacetRegistry_FacetNotRegistered",
          inputs: [],
        },
        {
          type: "error",
          name: "FailedDeployment",
          inputs: [],
        },
        {
          type: "error",
          name: "InsufficientBalance",
          inputs: [
            {
              name: "balance",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "needed",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
      ],
      inheritedFunctions: {},
    },
    DiamondFactory: {
      address: "0xcd8a1c3ba11cf5ecfa6267617243239504a98d90",
      abi: [
        {
          type: "constructor",
          inputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "createDiamond",
          inputs: [
            {
              name: "initParams",
              type: "tuple",
              internalType: "struct IDiamond.InitParams",
              components: [
                {
                  name: "baseFacets",
                  type: "tuple[]",
                  internalType: "struct IDiamond.FacetCut[]",
                  components: [
                    {
                      name: "facet",
                      type: "address",
                      internalType: "address",
                    },
                    {
                      name: "action",
                      type: "uint8",
                      internalType: "enum IDiamond.FacetCutAction",
                    },
                    {
                      name: "selectors",
                      type: "bytes4[]",
                      internalType: "bytes4[]",
                    },
                  ],
                },
                {
                  name: "init",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "initData",
                  type: "bytes",
                  internalType: "bytes",
                },
              ],
            },
          ],
          outputs: [
            {
              name: "diamond",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "owner",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "setSystemDiamond",
          inputs: [
            {
              name: "_systemDiamond",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "systemDiamond",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "event",
          name: "DiamondCreated",
          inputs: [
            {
              name: "diamond",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "deployer",
              type: "address",
              indexed: true,
              internalType: "address",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "OwnerSet",
          inputs: [
            {
              name: "owner",
              type: "address",
              indexed: true,
              internalType: "address",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "SystemDiamondSet",
          inputs: [
            {
              name: "systemDiamond",
              type: "address",
              indexed: true,
              internalType: "address",
            },
          ],
          anonymous: false,
        },
        {
          type: "error",
          name: "DiamondFactory_LoupeNotSupported",
          inputs: [],
        },
      ],
      inheritedFunctions: {},
    },
    TestToken: {
      address: "0x7bc06c482dead17c0e297afbc32f6e63d3846650",
      abi: [
        {
          type: "constructor",
          inputs: [
            {
              name: "name",
              type: "string",
              internalType: "string",
            },
            {
              name: "symbol",
              type: "string",
              internalType: "string",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "allowance",
          inputs: [
            {
              name: "owner",
              type: "address",
              internalType: "address",
            },
            {
              name: "spender",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "approve",
          inputs: [
            {
              name: "spender",
              type: "address",
              internalType: "address",
            },
            {
              name: "value",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bool",
              internalType: "bool",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "balanceOf",
          inputs: [
            {
              name: "account",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "decimals",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint8",
              internalType: "uint8",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "name",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "string",
              internalType: "string",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "symbol",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "string",
              internalType: "string",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "totalSupply",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "transfer",
          inputs: [
            {
              name: "to",
              type: "address",
              internalType: "address",
            },
            {
              name: "value",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bool",
              internalType: "bool",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "transferFrom",
          inputs: [
            {
              name: "from",
              type: "address",
              internalType: "address",
            },
            {
              name: "to",
              type: "address",
              internalType: "address",
            },
            {
              name: "value",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bool",
              internalType: "bool",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "event",
          name: "Approval",
          inputs: [
            {
              name: "owner",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "spender",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "value",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "Transfer",
          inputs: [
            {
              name: "from",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "to",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "value",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "error",
          name: "ERC20InsufficientAllowance",
          inputs: [
            {
              name: "spender",
              type: "address",
              internalType: "address",
            },
            {
              name: "allowance",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "needed",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
        {
          type: "error",
          name: "ERC20InsufficientBalance",
          inputs: [
            {
              name: "sender",
              type: "address",
              internalType: "address",
            },
            {
              name: "balance",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "needed",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
        {
          type: "error",
          name: "ERC20InvalidApprover",
          inputs: [
            {
              name: "approver",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "ERC20InvalidReceiver",
          inputs: [
            {
              name: "receiver",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "ERC20InvalidSender",
          inputs: [
            {
              name: "sender",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "ERC20InvalidSpender",
          inputs: [
            {
              name: "spender",
              type: "address",
              internalType: "address",
            },
          ],
        },
      ],
      inheritedFunctions: {
        allowance: "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol",
        approve: "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol",
        balanceOf: "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol",
        decimals: "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol",
        name: "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol",
        symbol: "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol",
        totalSupply:
          "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol",
        transfer: "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol",
        transferFrom:
          "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol",
      },
    },
  },
  100: {
    loop: {
      address: "0x67BBeDE3F4D1ae743dB4Fe11287eE425a8CD3216",
      abi: [
        {
          type: "function",
          name: "DiamondCut_init",
          inputs: [
            {
              name: "_systemAdmin",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "diamondCut",
          inputs: [
            {
              name: "facetCuts",
              type: "tuple[]",
              internalType: "struct IDiamond.FacetCut[]",
              components: [
                {
                  name: "facet",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "action",
                  type: "uint8",
                  internalType: "enum IDiamond.FacetCutAction",
                },
                {
                  name: "selectors",
                  type: "bytes4[]",
                  internalType: "bytes4[]",
                },
              ],
            },
            {
              name: "init",
              type: "address",
              internalType: "address",
            },
            {
              name: "initData",
              type: "bytes",
              internalType: "bytes",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "setSystemAdmin",
          inputs: [
            {
              name: "_admin",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "event",
          name: "DiamondCut",
          inputs: [
            {
              name: "facetCuts",
              type: "tuple[]",
              indexed: false,
              internalType: "struct IDiamond.FacetCut[]",
              components: [
                {
                  name: "facet",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "action",
                  type: "uint8",
                  internalType: "enum IDiamond.FacetCutAction",
                },
                {
                  name: "selectors",
                  type: "bytes4[]",
                  internalType: "bytes4[]",
                },
              ],
            },
            {
              name: "init",
              type: "address",
              indexed: false,
              internalType: "address",
            },
            {
              name: "initData",
              type: "bytes",
              indexed: false,
              internalType: "bytes",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "Initialized",
          inputs: [
            {
              name: "version",
              type: "uint64",
              indexed: false,
              internalType: "uint64",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "SystemAdminUpdated",
          inputs: [
            {
              name: "admin",
              type: "address",
              indexed: false,
              internalType: "address",
            },
          ],
          anonymous: false,
        },
        {
          type: "error",
          name: "AddressEmptyCode",
          inputs: [
            {
              name: "target",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "CallerIsNotAuthorized",
          inputs: [],
        },
        {
          type: "error",
          name: "CallerIsNotOwner",
          inputs: [],
        },
        {
          type: "error",
          name: "CallerIsNotSystemAdmin",
          inputs: [],
        },
        {
          type: "error",
          name: "DelegateNotAllowed",
          inputs: [],
        },
        {
          type: "error",
          name: "DiamondCut_CannotRemoveFromOtherFacet",
          inputs: [
            {
              name: "facet",
              type: "address",
              internalType: "address",
            },
            {
              name: "selector",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_FacetIsNotContract",
          inputs: [
            {
              name: "facet",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_FacetIsZeroAddress",
          inputs: [],
        },
        {
          type: "error",
          name: "DiamondCut_FunctionAlreadyExists",
          inputs: [
            {
              name: "selector",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_FunctionFromSameFacet",
          inputs: [
            {
              name: "selector",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_ImmutableFacet",
          inputs: [],
        },
        {
          type: "error",
          name: "DiamondCut_IncorrectFacetCutAction",
          inputs: [],
        },
        {
          type: "error",
          name: "DiamondCut_InitIsNotContract",
          inputs: [
            {
              name: "init",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_NonExistingFunction",
          inputs: [
            {
              name: "selector",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_SelectorArrayEmpty",
          inputs: [
            {
              name: "facet",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_SelectorIsZero",
          inputs: [],
        },
        {
          type: "error",
          name: "FailedCall",
          inputs: [],
        },
        {
          type: "error",
          name: "InvalidInitialization",
          inputs: [],
        },
        {
          type: "error",
          name: "NotInitializing",
          inputs: [],
        },
        {
          type: "error",
          name: "OnlyDelegate",
          inputs: [],
        },
        {
          type: "error",
          name: "ReentrancyGuardReentrantCall",
          inputs: [],
        },
        {
          type: "function",
          name: "DiamondLoupe_init",
          inputs: [],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "facetAddress",
          inputs: [
            {
              name: "selector",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "facetAddresses",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "address[]",
              internalType: "address[]",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "facetFunctionSelectors",
          inputs: [
            {
              name: "facet",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bytes4[]",
              internalType: "bytes4[]",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "facets",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "tuple[]",
              internalType: "struct IDiamondLoupeBase.Facet[]",
              components: [
                {
                  name: "facet",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "selectors",
                  type: "bytes4[]",
                  internalType: "bytes4[]",
                },
              ],
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "supportsInterface",
          inputs: [
            {
              name: "interfaceId",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bool",
              internalType: "bool",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "event",
          name: "Initialized",
          inputs: [
            {
              name: "version",
              type: "uint64",
              indexed: false,
              internalType: "uint64",
            },
          ],
          anonymous: false,
        },
        {
          type: "error",
          name: "CallerIsNotAuthorized",
          inputs: [],
        },
        {
          type: "error",
          name: "CallerIsNotOwner",
          inputs: [],
        },
        {
          type: "error",
          name: "DelegateNotAllowed",
          inputs: [],
        },
        {
          type: "error",
          name: "InvalidInitialization",
          inputs: [],
        },
        {
          type: "error",
          name: "NotInitializing",
          inputs: [],
        },
        {
          type: "error",
          name: "OnlyDelegate",
          inputs: [],
        },
        {
          type: "error",
          name: "ReentrancyGuardReentrantCall",
          inputs: [],
        },
        {
          type: "function",
          name: "Loop_init",
          inputs: [
            {
              name: "_token",
              type: "address",
              internalType: "address",
            },
            {
              name: "_loopAdmin",
              type: "address",
              internalType: "address",
            },
            {
              name: "_periodLength",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_percentPerPeriod",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_trustedBackendSigner",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "ONE_HUNDRED_PERCENT",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint8",
              internalType: "uint8",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "UNIT",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "claim",
          inputs: [],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "claimAndRegister",
          inputs: [
            {
              name: "signature",
              type: "bytes",
              internalType: "bytes",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "getClaimerStatus",
          inputs: [
            {
              name: "user",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "isRegistered",
              type: "bool",
              internalType: "bool",
            },
            {
              name: "hasClaimed",
              type: "bool",
              internalType: "bool",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getCurrentPeriod",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getCurrentPeriodData",
          inputs: [],
          outputs: [
            {
              name: "totalRegisteredUsers",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "maxPayout",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getLoopDetails",
          inputs: [],
          outputs: [
            {
              name: "token",
              type: "address",
              internalType: "address",
            },
            {
              name: "periodLength",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "percentPerPeriod",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "firstPeriodStart",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getPeriodIndividualPayout",
          inputs: [
            {
              name: "_periodNumber",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "setPercentPerPeriod",
          inputs: [
            {
              name: "_percentPerPeriod",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "setTrustedBackendSigner",
          inputs: [
            {
              name: "_newSigner",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "withdrawDeposit",
          inputs: [
            {
              name: "_to",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "event",
          name: "Claim",
          inputs: [
            {
              name: "claimer",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "periodNumber",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
            {
              name: "payout",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "FunctionAccessChanged",
          inputs: [
            {
              name: "functionSig",
              type: "bytes4",
              indexed: true,
              internalType: "bytes4",
            },
            {
              name: "role",
              type: "uint8",
              indexed: true,
              internalType: "uint8",
            },
            {
              name: "enabled",
              type: "bool",
              indexed: false,
              internalType: "bool",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "Initialize",
          inputs: [
            {
              name: "token",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "periodLength",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
            {
              name: "percentPerPeriod",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "Initialized",
          inputs: [
            {
              name: "version",
              type: "uint64",
              indexed: false,
              internalType: "uint64",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "Register",
          inputs: [
            {
              name: "sender",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "periodNumber",
              type: "uint256",
              indexed: true,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "SetPercentPerPeriod",
          inputs: [
            {
              name: "percentPerPeriod",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "TrustedBackendSignerUpdated",
          inputs: [
            {
              name: "newSigner",
              type: "address",
              indexed: true,
              internalType: "address",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "UserRoleUpdated",
          inputs: [
            {
              name: "user",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "role",
              type: "uint8",
              indexed: true,
              internalType: "uint8",
            },
            {
              name: "enabled",
              type: "bool",
              indexed: false,
              internalType: "bool",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "Withdraw",
          inputs: [
            {
              name: "admin",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "to",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "amount",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "error",
          name: "AccessControl_CallerIsNotAuthorized",
          inputs: [],
        },
        {
          type: "error",
          name: "AccessControl_CannotRemoveAdmin",
          inputs: [],
        },
        {
          type: "error",
          name: "AlreadyRegistered",
          inputs: [],
        },
        {
          type: "error",
          name: "CannotClaim",
          inputs: [],
        },
        {
          type: "error",
          name: "ECDSAInvalidSignature",
          inputs: [],
        },
        {
          type: "error",
          name: "ECDSAInvalidSignatureLength",
          inputs: [
            {
              name: "length",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
        {
          type: "error",
          name: "ECDSAInvalidSignatureS",
          inputs: [
            {
              name: "s",
              type: "bytes32",
              internalType: "bytes32",
            },
          ],
        },
        {
          type: "error",
          name: "FaucetBalanceIsZero",
          inputs: [],
        },
        {
          type: "error",
          name: "INVALID_ADDRESS",
          inputs: [],
        },
        {
          type: "error",
          name: "INVALID_ADMIN_ADDRESS",
          inputs: [],
        },
        {
          type: "error",
          name: "INVALID_SIGNER_ADDRESS",
          inputs: [],
        },
        {
          type: "error",
          name: "InvalidInitialization",
          inputs: [],
        },
        {
          type: "error",
          name: "InvalidPeriodLength",
          inputs: [],
        },
        {
          type: "error",
          name: "InvalidPeriodPercentage",
          inputs: [],
        },
        {
          type: "error",
          name: "NotAuthorized",
          inputs: [],
        },
        {
          type: "error",
          name: "NotInitializing",
          inputs: [],
        },
      ],
    },
    organization: {
      address: "0xeC2b460cB772f9003ff59810DB2A389440C7226D",
      abi: [
        {
          type: "function",
          name: "DiamondCut_init",
          inputs: [
            {
              name: "_systemAdmin",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "diamondCut",
          inputs: [
            {
              name: "facetCuts",
              type: "tuple[]",
              internalType: "struct IDiamond.FacetCut[]",
              components: [
                {
                  name: "facet",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "action",
                  type: "uint8",
                  internalType: "enum IDiamond.FacetCutAction",
                },
                {
                  name: "selectors",
                  type: "bytes4[]",
                  internalType: "bytes4[]",
                },
              ],
            },
            {
              name: "init",
              type: "address",
              internalType: "address",
            },
            {
              name: "initData",
              type: "bytes",
              internalType: "bytes",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "setSystemAdmin",
          inputs: [
            {
              name: "_admin",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "event",
          name: "DiamondCut",
          inputs: [
            {
              name: "facetCuts",
              type: "tuple[]",
              indexed: false,
              internalType: "struct IDiamond.FacetCut[]",
              components: [
                {
                  name: "facet",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "action",
                  type: "uint8",
                  internalType: "enum IDiamond.FacetCutAction",
                },
                {
                  name: "selectors",
                  type: "bytes4[]",
                  internalType: "bytes4[]",
                },
              ],
            },
            {
              name: "init",
              type: "address",
              indexed: false,
              internalType: "address",
            },
            {
              name: "initData",
              type: "bytes",
              indexed: false,
              internalType: "bytes",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "Initialized",
          inputs: [
            {
              name: "version",
              type: "uint64",
              indexed: false,
              internalType: "uint64",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "SystemAdminUpdated",
          inputs: [
            {
              name: "admin",
              type: "address",
              indexed: false,
              internalType: "address",
            },
          ],
          anonymous: false,
        },
        {
          type: "error",
          name: "AddressEmptyCode",
          inputs: [
            {
              name: "target",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "CallerIsNotAuthorized",
          inputs: [],
        },
        {
          type: "error",
          name: "CallerIsNotOwner",
          inputs: [],
        },
        {
          type: "error",
          name: "CallerIsNotSystemAdmin",
          inputs: [],
        },
        {
          type: "error",
          name: "DelegateNotAllowed",
          inputs: [],
        },
        {
          type: "error",
          name: "DiamondCut_CannotRemoveFromOtherFacet",
          inputs: [
            {
              name: "facet",
              type: "address",
              internalType: "address",
            },
            {
              name: "selector",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_FacetIsNotContract",
          inputs: [
            {
              name: "facet",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_FacetIsZeroAddress",
          inputs: [],
        },
        {
          type: "error",
          name: "DiamondCut_FunctionAlreadyExists",
          inputs: [
            {
              name: "selector",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_FunctionFromSameFacet",
          inputs: [
            {
              name: "selector",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_ImmutableFacet",
          inputs: [],
        },
        {
          type: "error",
          name: "DiamondCut_IncorrectFacetCutAction",
          inputs: [],
        },
        {
          type: "error",
          name: "DiamondCut_InitIsNotContract",
          inputs: [
            {
              name: "init",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_NonExistingFunction",
          inputs: [
            {
              name: "selector",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_SelectorArrayEmpty",
          inputs: [
            {
              name: "facet",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_SelectorIsZero",
          inputs: [],
        },
        {
          type: "error",
          name: "FailedCall",
          inputs: [],
        },
        {
          type: "error",
          name: "InvalidInitialization",
          inputs: [],
        },
        {
          type: "error",
          name: "NotInitializing",
          inputs: [],
        },
        {
          type: "error",
          name: "OnlyDelegate",
          inputs: [],
        },
        {
          type: "error",
          name: "ReentrancyGuardReentrantCall",
          inputs: [],
        },
        {
          type: "function",
          name: "DiamondLoupe_init",
          inputs: [],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "facetAddress",
          inputs: [
            {
              name: "selector",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "facetAddresses",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "address[]",
              internalType: "address[]",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "facetFunctionSelectors",
          inputs: [
            {
              name: "facet",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bytes4[]",
              internalType: "bytes4[]",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "facets",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "tuple[]",
              internalType: "struct IDiamondLoupeBase.Facet[]",
              components: [
                {
                  name: "facet",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "selectors",
                  type: "bytes4[]",
                  internalType: "bytes4[]",
                },
              ],
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "supportsInterface",
          inputs: [
            {
              name: "interfaceId",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bool",
              internalType: "bool",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "event",
          name: "Initialized",
          inputs: [
            {
              name: "version",
              type: "uint64",
              indexed: false,
              internalType: "uint64",
            },
          ],
          anonymous: false,
        },
        {
          type: "error",
          name: "CallerIsNotAuthorized",
          inputs: [],
        },
        {
          type: "error",
          name: "CallerIsNotOwner",
          inputs: [],
        },
        {
          type: "error",
          name: "DelegateNotAllowed",
          inputs: [],
        },
        {
          type: "error",
          name: "InvalidInitialization",
          inputs: [],
        },
        {
          type: "error",
          name: "NotInitializing",
          inputs: [],
        },
        {
          type: "error",
          name: "OnlyDelegate",
          inputs: [],
        },
        {
          type: "error",
          name: "ReentrancyGuardReentrantCall",
          inputs: [],
        },
        {
          type: "function",
          name: "Organization_init",
          inputs: [
            {
              name: "_name",
              type: "string",
              internalType: "string",
            },
            {
              name: "_admin",
              type: "address",
              internalType: "address",
            },
            {
              name: "_description",
              type: "string",
              internalType: "string",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "addAdmin",
          inputs: [
            {
              name: "newAdmin",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "createNewLoop",
          inputs: [
            {
              name: "systemDiamond",
              type: "address",
              internalType: "address",
            },
            {
              name: "token",
              type: "address",
              internalType: "address",
            },
            {
              name: "periodLength",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "percentPerPeriod",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "newLoop",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "getOrganizationAdmin",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getOrganizationDescription",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "string",
              internalType: "string",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getOrganizationName",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "string",
              internalType: "string",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "removeAdmin",
          inputs: [
            {
              name: "adminToRemove",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "event",
          name: "FunctionAccessChanged",
          inputs: [
            {
              name: "functionSig",
              type: "bytes4",
              indexed: true,
              internalType: "bytes4",
            },
            {
              name: "role",
              type: "uint8",
              indexed: true,
              internalType: "uint8",
            },
            {
              name: "enabled",
              type: "bool",
              indexed: false,
              internalType: "bool",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "Initialized",
          inputs: [
            {
              name: "version",
              type: "uint64",
              indexed: false,
              internalType: "uint64",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "LoopCreated",
          inputs: [
            {
              name: "loopAddress",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "token",
              type: "address",
              indexed: false,
              internalType: "address",
            },
            {
              name: "periodLength",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
            {
              name: "percentPerPeriod",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "UserRoleUpdated",
          inputs: [
            {
              name: "user",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "role",
              type: "uint8",
              indexed: true,
              internalType: "uint8",
            },
            {
              name: "enabled",
              type: "bool",
              indexed: false,
              internalType: "bool",
            },
          ],
          anonymous: false,
        },
        {
          type: "error",
          name: "AccessControl_CallerIsNotAuthorized",
          inputs: [],
        },
        {
          type: "error",
          name: "AccessControl_CannotRemoveAdmin",
          inputs: [],
        },
        {
          type: "error",
          name: "CallerIsNotAuthorized",
          inputs: [],
        },
        {
          type: "error",
          name: "CallerIsNotOwner",
          inputs: [],
        },
        {
          type: "error",
          name: "DelegateNotAllowed",
          inputs: [],
        },
        {
          type: "error",
          name: "InvalidInitialization",
          inputs: [],
        },
        {
          type: "error",
          name: "NotInitializing",
          inputs: [],
        },
        {
          type: "error",
          name: "OnlyDelegate",
          inputs: [],
        },
        {
          type: "error",
          name: "ReentrancyGuardReentrantCall",
          inputs: [],
        },
      ],
    },
    system_diamond: {
      address: "0xac9458dB08731160932e60769546453f8682819c",
      abi: [
        {
          type: "function",
          name: "AccessControl_init",
          inputs: [
            {
              name: "roleAdmin",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "canCall",
          inputs: [
            {
              name: "user",
              type: "address",
              internalType: "address",
            },
            {
              name: "functionSig",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bool",
              internalType: "bool",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "functionRoles",
          inputs: [
            {
              name: "functionSig",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bytes32",
              internalType: "bytes32",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "hasRole",
          inputs: [
            {
              name: "user",
              type: "address",
              internalType: "address",
            },
            {
              name: "role",
              type: "uint8",
              internalType: "uint8",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bool",
              internalType: "bool",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "roleHasAccess",
          inputs: [
            {
              name: "role",
              type: "uint8",
              internalType: "uint8",
            },
            {
              name: "functionSig",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bool",
              internalType: "bool",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "setFunctionAccess",
          inputs: [
            {
              name: "functionSig",
              type: "bytes4",
              internalType: "bytes4",
            },
            {
              name: "role",
              type: "uint8",
              internalType: "uint8",
            },
            {
              name: "enabled",
              type: "bool",
              internalType: "bool",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "setUserRole",
          inputs: [
            {
              name: "user",
              type: "address",
              internalType: "address",
            },
            {
              name: "role",
              type: "uint8",
              internalType: "uint8",
            },
            {
              name: "enabled",
              type: "bool",
              internalType: "bool",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "userRoles",
          inputs: [
            {
              name: "user",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bytes32",
              internalType: "bytes32",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "event",
          name: "FunctionAccessChanged",
          inputs: [
            {
              name: "functionSig",
              type: "bytes4",
              indexed: true,
              internalType: "bytes4",
            },
            {
              name: "role",
              type: "uint8",
              indexed: true,
              internalType: "uint8",
            },
            {
              name: "enabled",
              type: "bool",
              indexed: false,
              internalType: "bool",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "Initialized",
          inputs: [
            {
              name: "version",
              type: "uint64",
              indexed: false,
              internalType: "uint64",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "UserRoleUpdated",
          inputs: [
            {
              name: "user",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "role",
              type: "uint8",
              indexed: true,
              internalType: "uint8",
            },
            {
              name: "enabled",
              type: "bool",
              indexed: false,
              internalType: "bool",
            },
          ],
          anonymous: false,
        },
        {
          type: "error",
          name: "AccessControl_CallerIsNotAuthorized",
          inputs: [],
        },
        {
          type: "error",
          name: "AccessControl_CannotRemoveAdmin",
          inputs: [],
        },
        {
          type: "error",
          name: "CallerIsNotAuthorized",
          inputs: [],
        },
        {
          type: "error",
          name: "CallerIsNotOwner",
          inputs: [],
        },
        {
          type: "error",
          name: "DelegateNotAllowed",
          inputs: [],
        },
        {
          type: "error",
          name: "InvalidInitialization",
          inputs: [],
        },
        {
          type: "error",
          name: "NotInitializing",
          inputs: [],
        },
        {
          type: "error",
          name: "OnlyDelegate",
          inputs: [],
        },
        {
          type: "error",
          name: "ReentrancyGuardReentrantCall",
          inputs: [],
        },
        {
          type: "function",
          name: "DiamondCut_init",
          inputs: [
            {
              name: "_systemAdmin",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "diamondCut",
          inputs: [
            {
              name: "facetCuts",
              type: "tuple[]",
              internalType: "struct IDiamond.FacetCut[]",
              components: [
                {
                  name: "facet",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "action",
                  type: "uint8",
                  internalType: "enum IDiamond.FacetCutAction",
                },
                {
                  name: "selectors",
                  type: "bytes4[]",
                  internalType: "bytes4[]",
                },
              ],
            },
            {
              name: "init",
              type: "address",
              internalType: "address",
            },
            {
              name: "initData",
              type: "bytes",
              internalType: "bytes",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "setSystemAdmin",
          inputs: [
            {
              name: "_admin",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "event",
          name: "DiamondCut",
          inputs: [
            {
              name: "facetCuts",
              type: "tuple[]",
              indexed: false,
              internalType: "struct IDiamond.FacetCut[]",
              components: [
                {
                  name: "facet",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "action",
                  type: "uint8",
                  internalType: "enum IDiamond.FacetCutAction",
                },
                {
                  name: "selectors",
                  type: "bytes4[]",
                  internalType: "bytes4[]",
                },
              ],
            },
            {
              name: "init",
              type: "address",
              indexed: false,
              internalType: "address",
            },
            {
              name: "initData",
              type: "bytes",
              indexed: false,
              internalType: "bytes",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "Initialized",
          inputs: [
            {
              name: "version",
              type: "uint64",
              indexed: false,
              internalType: "uint64",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "SystemAdminUpdated",
          inputs: [
            {
              name: "admin",
              type: "address",
              indexed: false,
              internalType: "address",
            },
          ],
          anonymous: false,
        },
        {
          type: "error",
          name: "AddressEmptyCode",
          inputs: [
            {
              name: "target",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "CallerIsNotAuthorized",
          inputs: [],
        },
        {
          type: "error",
          name: "CallerIsNotOwner",
          inputs: [],
        },
        {
          type: "error",
          name: "CallerIsNotSystemAdmin",
          inputs: [],
        },
        {
          type: "error",
          name: "DelegateNotAllowed",
          inputs: [],
        },
        {
          type: "error",
          name: "DiamondCut_CannotRemoveFromOtherFacet",
          inputs: [
            {
              name: "facet",
              type: "address",
              internalType: "address",
            },
            {
              name: "selector",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_FacetIsNotContract",
          inputs: [
            {
              name: "facet",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_FacetIsZeroAddress",
          inputs: [],
        },
        {
          type: "error",
          name: "DiamondCut_FunctionAlreadyExists",
          inputs: [
            {
              name: "selector",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_FunctionFromSameFacet",
          inputs: [
            {
              name: "selector",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_ImmutableFacet",
          inputs: [],
        },
        {
          type: "error",
          name: "DiamondCut_IncorrectFacetCutAction",
          inputs: [],
        },
        {
          type: "error",
          name: "DiamondCut_InitIsNotContract",
          inputs: [
            {
              name: "init",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_NonExistingFunction",
          inputs: [
            {
              name: "selector",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_SelectorArrayEmpty",
          inputs: [
            {
              name: "facet",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "DiamondCut_SelectorIsZero",
          inputs: [],
        },
        {
          type: "error",
          name: "FailedCall",
          inputs: [],
        },
        {
          type: "error",
          name: "InvalidInitialization",
          inputs: [],
        },
        {
          type: "error",
          name: "NotInitializing",
          inputs: [],
        },
        {
          type: "error",
          name: "OnlyDelegate",
          inputs: [],
        },
        {
          type: "error",
          name: "ReentrancyGuardReentrantCall",
          inputs: [],
        },
        {
          type: "function",
          name: "DiamondLoupe_init",
          inputs: [],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "facetAddress",
          inputs: [
            {
              name: "selector",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "facetAddresses",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "address[]",
              internalType: "address[]",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "facetFunctionSelectors",
          inputs: [
            {
              name: "facet",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bytes4[]",
              internalType: "bytes4[]",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "facets",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "tuple[]",
              internalType: "struct IDiamondLoupeBase.Facet[]",
              components: [
                {
                  name: "facet",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "selectors",
                  type: "bytes4[]",
                  internalType: "bytes4[]",
                },
              ],
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "supportsInterface",
          inputs: [
            {
              name: "interfaceId",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bool",
              internalType: "bool",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "event",
          name: "Initialized",
          inputs: [
            {
              name: "version",
              type: "uint64",
              indexed: false,
              internalType: "uint64",
            },
          ],
          anonymous: false,
        },
        {
          type: "error",
          name: "CallerIsNotAuthorized",
          inputs: [],
        },
        {
          type: "error",
          name: "CallerIsNotOwner",
          inputs: [],
        },
        {
          type: "error",
          name: "DelegateNotAllowed",
          inputs: [],
        },
        {
          type: "error",
          name: "InvalidInitialization",
          inputs: [],
        },
        {
          type: "error",
          name: "NotInitializing",
          inputs: [],
        },
        {
          type: "error",
          name: "OnlyDelegate",
          inputs: [],
        },
        {
          type: "error",
          name: "ReentrancyGuardReentrantCall",
          inputs: [],
        },
        {
          type: "function",
          name: "LoopFactory_init",
          inputs: [
            {
              name: "diamondFactory",
              type: "address",
              internalType: "address",
            },
            {
              name: "facetRegistry",
              type: "address",
              internalType: "address",
            },
            {
              name: "_trustedBackendSigner",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "createLoop",
          inputs: [
            {
              name: "organization",
              type: "address",
              internalType: "address",
            },
            {
              name: "token",
              type: "address",
              internalType: "address",
            },
            {
              name: "admin",
              type: "address",
              internalType: "address",
            },
            {
              name: "periodLength",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "percentPerPeriod",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "newLoop",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "getLoopsByOrganization",
          inputs: [
            {
              name: "organization",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "",
              type: "address[]",
              internalType: "address[]",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "setTrustedBackendSigner",
          inputs: [
            {
              name: "_newSigner",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "event",
          name: "FunctionAccessChanged",
          inputs: [
            {
              name: "functionSig",
              type: "bytes4",
              indexed: true,
              internalType: "bytes4",
            },
            {
              name: "role",
              type: "uint8",
              indexed: true,
              internalType: "uint8",
            },
            {
              name: "enabled",
              type: "bool",
              indexed: false,
              internalType: "bool",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "Initialized",
          inputs: [
            {
              name: "version",
              type: "uint64",
              indexed: false,
              internalType: "uint64",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "LoopCreated",
          inputs: [
            {
              name: "loopId",
              type: "uint256",
              indexed: true,
              internalType: "uint256",
            },
            {
              name: "loopAddress",
              type: "address",
              indexed: false,
              internalType: "address",
            },
            {
              name: "organization",
              type: "address",
              indexed: false,
              internalType: "address",
            },
            {
              name: "token",
              type: "address",
              indexed: false,
              internalType: "address",
            },
            {
              name: "periodLength",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
            {
              name: "percentPerPeriod",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "TrustedBackendSignerUpdated",
          inputs: [
            {
              name: "newSigner",
              type: "address",
              indexed: true,
              internalType: "address",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "UserRoleUpdated",
          inputs: [
            {
              name: "user",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "role",
              type: "uint8",
              indexed: true,
              internalType: "uint8",
            },
            {
              name: "enabled",
              type: "bool",
              indexed: false,
              internalType: "bool",
            },
          ],
          anonymous: false,
        },
        {
          type: "error",
          name: "AccessControl_CallerIsNotAuthorized",
          inputs: [],
        },
        {
          type: "error",
          name: "AccessControl_CannotRemoveAdmin",
          inputs: [],
        },
        {
          type: "error",
          name: "CallerIsNotAuthorized",
          inputs: [],
        },
        {
          type: "error",
          name: "CallerIsNotOwner",
          inputs: [],
        },
        {
          type: "error",
          name: "DelegateNotAllowed",
          inputs: [],
        },
        {
          type: "error",
          name: "InvalidInitialization",
          inputs: [],
        },
        {
          type: "error",
          name: "NotInitializing",
          inputs: [],
        },
        {
          type: "error",
          name: "OnlyDelegate",
          inputs: [],
        },
        {
          type: "error",
          name: "ReentrancyGuardReentrantCall",
          inputs: [],
        },
        {
          type: "function",
          name: "ADMIN_ROLE",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "bytes32",
              internalType: "bytes32",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "OrganizationFactory_init",
          inputs: [
            {
              name: "diamondFactory",
              type: "address",
              internalType: "address",
            },
            {
              name: "facetRegistry",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "createOrganization",
          inputs: [
            {
              name: "name",
              type: "string",
              internalType: "string",
            },
            {
              name: "admin",
              type: "address",
              internalType: "address",
            },
            {
              name: "description",
              type: "string",
              internalType: "string",
            },
          ],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "getOrganizationById",
          inputs: [
            {
              name: "id",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getOrganizationCount",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "event",
          name: "FunctionAccessChanged",
          inputs: [
            {
              name: "functionSig",
              type: "bytes4",
              indexed: true,
              internalType: "bytes4",
            },
            {
              name: "role",
              type: "uint8",
              indexed: true,
              internalType: "uint8",
            },
            {
              name: "enabled",
              type: "bool",
              indexed: false,
              internalType: "bool",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "Initialized",
          inputs: [
            {
              name: "version",
              type: "uint64",
              indexed: false,
              internalType: "uint64",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "OrganizationCreated",
          inputs: [
            {
              name: "id",
              type: "uint256",
              indexed: true,
              internalType: "uint256",
            },
            {
              name: "organizationAddress",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "name",
              type: "string",
              indexed: false,
              internalType: "string",
            },
            {
              name: "admin",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "description",
              type: "string",
              indexed: false,
              internalType: "string",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "UserRoleUpdated",
          inputs: [
            {
              name: "user",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "role",
              type: "uint8",
              indexed: true,
              internalType: "uint8",
            },
            {
              name: "enabled",
              type: "bool",
              indexed: false,
              internalType: "bool",
            },
          ],
          anonymous: false,
        },
        {
          type: "error",
          name: "AccessControl_CallerIsNotAuthorized",
          inputs: [],
        },
        {
          type: "error",
          name: "AccessControl_CannotRemoveAdmin",
          inputs: [],
        },
        {
          type: "error",
          name: "CallerIsNotAuthorized",
          inputs: [],
        },
        {
          type: "error",
          name: "CallerIsNotOwner",
          inputs: [],
        },
        {
          type: "error",
          name: "DelegateNotAllowed",
          inputs: [],
        },
        {
          type: "error",
          name: "InvalidInitialization",
          inputs: [],
        },
        {
          type: "error",
          name: "NotInitializing",
          inputs: [],
        },
        {
          type: "error",
          name: "OnlyDelegate",
          inputs: [],
        },
        {
          type: "error",
          name: "ReentrancyGuardReentrantCall",
          inputs: [],
        },
      ],
    },
    test_token_address: {
      address: "0x117DD6C99a9b5286994448D0300DE22952E8F66f",
      abi: [
        {
          type: "constructor",
          inputs: [
            {
              name: "name",
              type: "string",
              internalType: "string",
            },
            {
              name: "symbol",
              type: "string",
              internalType: "string",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "allowance",
          inputs: [
            {
              name: "owner",
              type: "address",
              internalType: "address",
            },
            {
              name: "spender",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "approve",
          inputs: [
            {
              name: "spender",
              type: "address",
              internalType: "address",
            },
            {
              name: "value",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bool",
              internalType: "bool",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "balanceOf",
          inputs: [
            {
              name: "account",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "decimals",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint8",
              internalType: "uint8",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "name",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "string",
              internalType: "string",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "symbol",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "string",
              internalType: "string",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "totalSupply",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "transfer",
          inputs: [
            {
              name: "to",
              type: "address",
              internalType: "address",
            },
            {
              name: "value",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bool",
              internalType: "bool",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "transferFrom",
          inputs: [
            {
              name: "from",
              type: "address",
              internalType: "address",
            },
            {
              name: "to",
              type: "address",
              internalType: "address",
            },
            {
              name: "value",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bool",
              internalType: "bool",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "event",
          name: "Approval",
          inputs: [
            {
              name: "owner",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "spender",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "value",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "Transfer",
          inputs: [
            {
              name: "from",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "to",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "value",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "error",
          name: "ERC20InsufficientAllowance",
          inputs: [
            {
              name: "spender",
              type: "address",
              internalType: "address",
            },
            {
              name: "allowance",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "needed",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
        {
          type: "error",
          name: "ERC20InsufficientBalance",
          inputs: [
            {
              name: "sender",
              type: "address",
              internalType: "address",
            },
            {
              name: "balance",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "needed",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
        {
          type: "error",
          name: "ERC20InvalidApprover",
          inputs: [
            {
              name: "approver",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "ERC20InvalidReceiver",
          inputs: [
            {
              name: "receiver",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "ERC20InvalidSender",
          inputs: [
            {
              name: "sender",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "ERC20InvalidSpender",
          inputs: [
            {
              name: "spender",
              type: "address",
              internalType: "address",
            },
          ],
        },
      ],
    },
    FacetRegistry: {
      address: "0xcfdb264f2c33de86d3531e56f57b602a6b1585f3",
      abi: [
        {
          type: "constructor",
          inputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "addFacet",
          inputs: [
            {
              name: "facet",
              type: "address",
              internalType: "address",
            },
            {
              name: "selectors",
              type: "bytes4[]",
              internalType: "bytes4[]",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "computeFacetAddress",
          inputs: [
            {
              name: "salt",
              type: "bytes32",
              internalType: "bytes32",
            },
            {
              name: "creationCode",
              type: "bytes",
              internalType: "bytes",
            },
          ],
          outputs: [
            {
              name: "facet",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "deployFacet",
          inputs: [
            {
              name: "salt",
              type: "bytes32",
              internalType: "bytes32",
            },
            {
              name: "creationCode",
              type: "bytes",
              internalType: "bytes",
            },
            {
              name: "selectors",
              type: "bytes4[]",
              internalType: "bytes4[]",
            },
          ],
          outputs: [
            {
              name: "facet",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "facetAddresses",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "address[]",
              internalType: "address[]",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "facetSelectors",
          inputs: [
            {
              name: "facet",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bytes4[]",
              internalType: "bytes4[]",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getFacetBySelector",
          inputs: [
            {
              name: "selector",
              type: "bytes4",
              internalType: "bytes4",
            },
          ],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "owner",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "removeFacet",
          inputs: [
            {
              name: "facet",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "event",
          name: "FacetRegistered",
          inputs: [
            {
              name: "facet",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "selectors",
              type: "bytes4[]",
              indexed: false,
              internalType: "bytes4[]",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "FacetUnregistered",
          inputs: [
            {
              name: "facet",
              type: "address",
              indexed: true,
              internalType: "address",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "OwnerSet",
          inputs: [
            {
              name: "owner",
              type: "address",
              indexed: true,
              internalType: "address",
            },
          ],
          anonymous: false,
        },
        {
          type: "error",
          name: "Create2EmptyBytecode",
          inputs: [],
        },
        {
          type: "error",
          name: "FacetRegistry_FacetAddressZero",
          inputs: [],
        },
        {
          type: "error",
          name: "FacetRegistry_FacetAlreadyRegistered",
          inputs: [],
        },
        {
          type: "error",
          name: "FacetRegistry_FacetMustHaveSelectors",
          inputs: [],
        },
        {
          type: "error",
          name: "FacetRegistry_FacetNotContract",
          inputs: [],
        },
        {
          type: "error",
          name: "FacetRegistry_FacetNotRegistered",
          inputs: [],
        },
        {
          type: "error",
          name: "FailedDeployment",
          inputs: [],
        },
        {
          type: "error",
          name: "InsufficientBalance",
          inputs: [
            {
              name: "balance",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "needed",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
      ],
      inheritedFunctions: {},
    },
    DiamondFactory: {
      address: "0x1a0c4a80afe1e9fa2ac526991b4baee1b4dcf9b1",
      abi: [
        {
          type: "constructor",
          inputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "createDiamond",
          inputs: [
            {
              name: "initParams",
              type: "tuple",
              internalType: "struct IDiamond.InitParams",
              components: [
                {
                  name: "baseFacets",
                  type: "tuple[]",
                  internalType: "struct IDiamond.FacetCut[]",
                  components: [
                    {
                      name: "facet",
                      type: "address",
                      internalType: "address",
                    },
                    {
                      name: "action",
                      type: "uint8",
                      internalType: "enum IDiamond.FacetCutAction",
                    },
                    {
                      name: "selectors",
                      type: "bytes4[]",
                      internalType: "bytes4[]",
                    },
                  ],
                },
                {
                  name: "init",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "initData",
                  type: "bytes",
                  internalType: "bytes",
                },
              ],
            },
          ],
          outputs: [
            {
              name: "diamond",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "owner",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "setSystemDiamond",
          inputs: [
            {
              name: "_systemDiamond",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "systemDiamond",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "event",
          name: "DiamondCreated",
          inputs: [
            {
              name: "diamond",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "deployer",
              type: "address",
              indexed: true,
              internalType: "address",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "OwnerSet",
          inputs: [
            {
              name: "owner",
              type: "address",
              indexed: true,
              internalType: "address",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "SystemDiamondSet",
          inputs: [
            {
              name: "systemDiamond",
              type: "address",
              indexed: true,
              internalType: "address",
            },
          ],
          anonymous: false,
        },
        {
          type: "error",
          name: "DiamondFactory_LoupeNotSupported",
          inputs: [],
        },
      ],
      inheritedFunctions: {},
    },
    TestToken: {
      address: "0x117dd6c99a9b5286994448d0300de22952e8f66f",
      abi: [
        {
          type: "constructor",
          inputs: [
            {
              name: "name",
              type: "string",
              internalType: "string",
            },
            {
              name: "symbol",
              type: "string",
              internalType: "string",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "allowance",
          inputs: [
            {
              name: "owner",
              type: "address",
              internalType: "address",
            },
            {
              name: "spender",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "approve",
          inputs: [
            {
              name: "spender",
              type: "address",
              internalType: "address",
            },
            {
              name: "value",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bool",
              internalType: "bool",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "balanceOf",
          inputs: [
            {
              name: "account",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "decimals",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint8",
              internalType: "uint8",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "name",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "string",
              internalType: "string",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "symbol",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "string",
              internalType: "string",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "totalSupply",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "transfer",
          inputs: [
            {
              name: "to",
              type: "address",
              internalType: "address",
            },
            {
              name: "value",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bool",
              internalType: "bool",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "transferFrom",
          inputs: [
            {
              name: "from",
              type: "address",
              internalType: "address",
            },
            {
              name: "to",
              type: "address",
              internalType: "address",
            },
            {
              name: "value",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bool",
              internalType: "bool",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "event",
          name: "Approval",
          inputs: [
            {
              name: "owner",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "spender",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "value",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "Transfer",
          inputs: [
            {
              name: "from",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "to",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "value",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "error",
          name: "ERC20InsufficientAllowance",
          inputs: [
            {
              name: "spender",
              type: "address",
              internalType: "address",
            },
            {
              name: "allowance",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "needed",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
        {
          type: "error",
          name: "ERC20InsufficientBalance",
          inputs: [
            {
              name: "sender",
              type: "address",
              internalType: "address",
            },
            {
              name: "balance",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "needed",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
        {
          type: "error",
          name: "ERC20InvalidApprover",
          inputs: [
            {
              name: "approver",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "ERC20InvalidReceiver",
          inputs: [
            {
              name: "receiver",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "ERC20InvalidSender",
          inputs: [
            {
              name: "sender",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "ERC20InvalidSpender",
          inputs: [
            {
              name: "spender",
              type: "address",
              internalType: "address",
            },
          ],
        },
      ],
      inheritedFunctions: {},
    },
  },
} as const;

export default deployedContracts
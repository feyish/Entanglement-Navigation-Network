;; Quantum Navigation Channel NFT Contract

(define-non-fungible-token navigation-channel-nft uint)

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_INVALID_NFT (err u101))

;; Data variables
(define-data-var last-token-id uint u0)

;; Data maps
(define-map token-metadata
  uint
  {
    creator: principal,
    channel-type: (string-ascii 50),
    description: (string-utf8 500),
    precision: uint,
    associated-beacons: (list 5 uint),
    creation-time: uint
  }
)

;; Public functions
(define-public (mint-navigation-channel (channel-type (string-ascii 50)) (description (string-utf8 500)) (precision uint) (associated-beacons (list 5 uint)))
  (let
    (
      (token-id (+ (var-get last-token-id) u1))
    )
    (asserts! (and (>= precision u0) (<= precision u100)) ERR_NOT_AUTHORIZED)
    (try! (nft-mint? navigation-channel-nft token-id tx-sender))
    (map-set token-metadata
      token-id
      {
        creator: tx-sender,
        channel-type: channel-type,
        description: description,
        precision: precision,
        associated-beacons: associated-beacons,
        creation-time: block-height
      }
    )
    (var-set last-token-id token-id)
    (ok token-id)
  )
)

(define-public (transfer-navigation-channel (token-id uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender (unwrap! (nft-get-owner? navigation-channel-nft token-id) ERR_INVALID_NFT)) ERR_NOT_AUTHORIZED)
    (try! (nft-transfer? navigation-channel-nft token-id tx-sender recipient))
    (ok true)
  )
)

;; Read-only functions
(define-read-only (get-navigation-channel-metadata (token-id uint))
  (map-get? token-metadata token-id)
)

(define-read-only (get-navigation-channel-owner (token-id uint))
  (nft-get-owner? navigation-channel-nft token-id)
)

(define-read-only (get-last-token-id)
  (var-get last-token-id)
)


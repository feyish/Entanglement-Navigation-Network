;; Navigation Data Marketplace Contract

(define-fungible-token navigation-token)

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_INVALID_LISTING (err u101))
(define-constant ERR_INSUFFICIENT_BALANCE (err u102))

;; Data variables
(define-data-var listing-count uint u0)

;; Data maps
(define-map data-listings
  uint
  {
    seller: principal,
    data-type: (string-ascii 50),
    description: (string-utf8 500),
    price: uint,
    accuracy: uint,
    expiration: uint
  }
)

;; Public functions
(define-public (create-listing (data-type (string-ascii 50)) (description (string-utf8 500)) (price uint) (accuracy uint) (expiration uint))
  (let
    (
      (listing-id (+ (var-get listing-count) u1))
    )
    (asserts! (and (>= accuracy u0) (<= accuracy u100)) ERR_NOT_AUTHORIZED)
    (map-set data-listings
      listing-id
      {
        seller: tx-sender,
        data-type: data-type,
        description: description,
        price: price,
        accuracy: accuracy,
        expiration: (+ block-height expiration)
      }
    )
    (var-set listing-count listing-id)
    (ok listing-id)
  )
)

(define-public (purchase-data (listing-id uint))
  (let
    (
      (listing (unwrap! (map-get? data-listings listing-id) ERR_INVALID_LISTING))
      (buyer tx-sender)
    )
    (asserts! (>= (ft-get-balance navigation-token buyer) (get price listing)) ERR_INSUFFICIENT_BALANCE)
    (asserts! (< block-height (get expiration listing)) ERR_INVALID_LISTING)
    (try! (ft-transfer? navigation-token (get price listing) buyer (get seller listing)))
    (map-delete data-listings listing-id)
    (ok true)
  )
)

(define-public (cancel-listing (listing-id uint))
  (let
    (
      (listing (unwrap! (map-get? data-listings listing-id) ERR_INVALID_LISTING))
    )
    (asserts! (is-eq tx-sender (get seller listing)) ERR_NOT_AUTHORIZED)
    (map-delete data-listings listing-id)
    (ok true)
  )
)

;; Read-only functions
(define-read-only (get-listing (listing-id uint))
  (map-get? data-listings listing-id)
)

(define-read-only (get-listing-count)
  (var-get listing-count)
)


;; Quantum Beacon Management Contract

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_INVALID_BEACON (err u101))
(define-constant ERR_INVALID_STATUS (err u102))

;; Data variables
(define-data-var beacon-count uint u0)

;; Data maps
(define-map quantum-beacons
  uint
  {
    deployer: principal,
    location: (string-ascii 100),
    entanglement-key: (buff 32),
    status: (string-ascii 20),
    deployment-time: uint,
    last-update: uint
  }
)

;; Public functions
(define-public (deploy-beacon (location (string-ascii 100)) (entanglement-key (buff 32)))
  (let
    (
      (beacon-id (+ (var-get beacon-count) u1))
    )
    (map-set quantum-beacons
      beacon-id
      {
        deployer: tx-sender,
        location: location,
        entanglement-key: entanglement-key,
        status: "active",
        deployment-time: block-height,
        last-update: block-height
      }
    )
    (var-set beacon-count beacon-id)
    (ok beacon-id)
  )
)

(define-public (update-beacon-status (beacon-id uint) (new-status (string-ascii 20)))
  (let
    (
      (beacon (unwrap! (map-get? quantum-beacons beacon-id) ERR_INVALID_BEACON))
    )
    (asserts! (or (is-eq tx-sender CONTRACT_OWNER) (is-eq tx-sender (get deployer beacon))) ERR_NOT_AUTHORIZED)
    (asserts! (or (is-eq new-status "active") (is-eq new-status "inactive") (is-eq new-status "maintenance")) ERR_INVALID_STATUS)
    (ok (map-set quantum-beacons
      beacon-id
      (merge beacon {
        status: new-status,
        last-update: block-height
      })
    ))
  )
)

(define-public (update-entanglement-key (beacon-id uint) (new-key (buff 32)))
  (let
    (
      (beacon (unwrap! (map-get? quantum-beacons beacon-id) ERR_INVALID_BEACON))
    )
    (asserts! (or (is-eq tx-sender CONTRACT_OWNER) (is-eq tx-sender (get deployer beacon))) ERR_NOT_AUTHORIZED)
    (ok (map-set quantum-beacons
      beacon-id
      (merge beacon {
        entanglement-key: new-key,
        last-update: block-height
      })
    ))
  )
)

;; Read-only functions
(define-read-only (get-beacon (beacon-id uint))
  (map-get? quantum-beacons beacon-id)
)

(define-read-only (get-beacon-count)
  (var-get beacon-count)
)


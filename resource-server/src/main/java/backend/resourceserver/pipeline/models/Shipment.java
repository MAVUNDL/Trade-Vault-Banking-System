package backend.resourceserver.pipeline.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@JsonIgnoreProperties(ignoreUnknown = true)
public record Shipment(
        String shipmentNumber,
        String indentNumber,
        String ifbReference,
        String customerName,
        String buyerFullName,
        String supplierName,
        String portOfLoad,
        String portOfDischarge,
        LocalDateTime shipOnBoard,
        LocalDateTime eta,
        LocalDateTime deliveryDate,
        String currencyCode,
        BigDecimal orderValue,
        BigDecimal shippedValue,
        BigDecimal paidAmount,
        String incoterm,
        String status,
        String movementType,
        String shipmentMode,
        LocalDateTime mvStartDate,
        LocalDateTime mvEndDate,
        String vesselName,
        String containerNumber,
        String containerCount,
        String containerType,
        String loadType,
        Integer pallets,
        Integer cartons,
        String deliveryContact,
        String deliveryMonth,
        String deliveryYear,
        String deliveryAddress,
        BigDecimal unitPrice,
        String itemReference,
        String quantity,
        String description,
        String estimatedLandedCost
) {}

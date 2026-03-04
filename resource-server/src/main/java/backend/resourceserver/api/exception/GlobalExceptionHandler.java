package backend.resourceserver.api.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // This catches the exact RuntimeException we threw for Insufficient Funds
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntimeException(RuntimeException ex) {

        // This packages the error message into a neat JSON object
        // that your React apiFetch wrapper can easily read.
        return ResponseEntity
                .badRequest() // Returns HTTP 400 (Bad Request) instead of 500 (Server Error)
                .body(Map.of(
                        "status", 400,
                        "error", "Bad Request",
                        "message", ex.getMessage() // e.g., "Insufficient funds to complete this transaction."
                ));
    }
}
package com.barbarizoo.common;

/** Thrown when a requested entity does not exist within the current tenant. */
public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}

package com.barbarizoo.common;

/** Thrown for invalid business operations (e.g. booking a slot that is taken). */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}

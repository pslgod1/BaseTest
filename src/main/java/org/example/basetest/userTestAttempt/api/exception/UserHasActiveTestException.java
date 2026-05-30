package org.example.basetest.userTestAttempt.api.exception;

public class UserHasActiveTestException extends IllegalStateException{
    public UserHasActiveTestException(String message) {
        super(message);
    }
}
